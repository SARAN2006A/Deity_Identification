"""
Train a Murugan / Amman / Perumal / Shivan sculpture classifier
using transfer learning on a pretrained ResNet50.

Expected folder structure (matches the Wikimedia scraper output):

    deity_dataset/
        murugan/   *.jpg
        amman/     *.jpg
        perumal/   *.jpg
        shivan/    *.jpg

Usage:
    python train.py --data_dir deity_dataset --epochs 15 --out model.pt
"""

import argparse
import copy
import json
import os

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, models, transforms


def build_dataloaders(data_dir, batch_size, val_split=0.2, img_size=224):
    train_tf = transforms.Compose([
        transforms.RandomResizedCrop(img_size, scale=(0.7, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        transforms.RandomErasing(p=0.3, scale=(0.02, 0.15)),
    ])
    val_tf = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(img_size),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    full_dataset = datasets.ImageFolder(data_dir)
    class_names = full_dataset.classes

    n_val = max(1, int(len(full_dataset) * val_split))
    n_train = len(full_dataset) - n_val
    train_subset, val_subset = random_split(
        full_dataset, [n_train, n_val], generator=torch.Generator().manual_seed(42)
    )

    # Apply different transforms per split by wrapping
    train_subset.dataset = copy.copy(full_dataset)
    train_subset.dataset.transform = train_tf
    val_subset.dataset = copy.copy(full_dataset)
    val_subset.dataset.transform = val_tf

    train_loader = DataLoader(train_subset, batch_size=batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_subset, batch_size=batch_size, shuffle=False, num_workers=2)
    return train_loader, val_loader, class_names


def compute_class_weights(data_dir, class_names):
    """Inverse-frequency weights to handle class imbalance (common in this domain)."""
    counts = []
    for c in class_names:
        class_dir = os.path.join(data_dir, c)
        n = len([f for f in os.listdir(class_dir) if not f.startswith(".")])
        counts.append(max(n, 1))
    total = sum(counts)
    weights = [total / (len(counts) * c) for c in counts]
    return torch.tensor(weights, dtype=torch.float32)


def build_model(num_classes, pretrained=True, dropout=0.5):
    model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT if pretrained else None)
    # Freeze backbone, only train the new head first
    for param in model.parameters():
        param.requires_grad = False
    in_features = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(dropout),
        nn.Linear(in_features, num_classes),
    )
    return model


def evaluate(model, loader, device, class_names):
    model.eval()
    correct = 0
    total = 0
    per_class_correct = {c: 0 for c in class_names}
    per_class_total = {c: 0 for c in class_names}
    with torch.no_grad():
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            preds = outputs.argmax(dim=1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
            for p, l in zip(preds.cpu().tolist(), labels.cpu().tolist()):
                cname = class_names[l]
                per_class_total[cname] += 1
                if p == l:
                    per_class_correct[cname] += 1
    overall_acc = correct / total if total else 0.0
    per_class_acc = {
        c: (per_class_correct[c] / per_class_total[c] if per_class_total[c] else None)
        for c in class_names
    }
    return overall_acc, per_class_acc


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", required=True, help="Path to folder with one subfolder per class")
    parser.add_argument("--epochs", type=int, default=15)
    parser.add_argument("--batch_size", type=int, default=16)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--unfreeze_after", type=int, default=5,
                         help="Epoch at which to unfreeze the backbone for fine-tuning")
    parser.add_argument("--out", default="model.pt")
    parser.add_argument("--no_pretrained", action="store_true",
                         help="Disable pretrained weights (for offline sanity-testing only)")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    train_loader, val_loader, class_names = build_dataloaders(args.data_dir, args.batch_size)
    print(f"Classes found: {class_names}")

    class_weights = compute_class_weights(args.data_dir, class_names).to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)

    model = build_model(num_classes=len(class_names), pretrained=not args.no_pretrained).to(device)
    optimizer = torch.optim.Adam(model.fc.parameters(), lr=args.lr, weight_decay=1e-4)

    best_acc = 0.0
    best_state = None
    unfrozen = False
    epochs_since_improvement = 0
    patience = 6  # stop early if val_acc hasn't improved in this many epochs

    for epoch in range(args.epochs):
        if epoch == args.unfreeze_after and not unfrozen:
            print("Unfreezing backbone for fine-tuning at lower learning rate")
            for param in model.parameters():
                param.requires_grad = True
            optimizer = torch.optim.Adam(model.parameters(), lr=args.lr / 10, weight_decay=1e-4)
            unfrozen = True

        model.train()
        running_loss = 0.0
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * images.size(0)

        train_loss = running_loss / len(train_loader.dataset)
        val_acc, per_class_acc = evaluate(model, val_loader, device, class_names)
        print(f"Epoch {epoch+1}/{args.epochs} - train_loss: {train_loss:.4f} - val_acc: {val_acc:.4f}")
        print(f"  per-class: {per_class_acc}")

        if val_acc > best_acc:
            best_acc = val_acc
            best_state = copy.deepcopy(model.state_dict())
            epochs_since_improvement = 0
        else:
            epochs_since_improvement += 1
            if epochs_since_improvement >= patience:
                print(f"No improvement in {patience} epochs, stopping early at epoch {epoch+1}")
                break

    if best_state is not None:
        model.load_state_dict(best_state)

    torch.save({
        "model_state": model.state_dict(),
        "class_names": class_names,
    }, args.out)

    with open(args.out + ".classes.json", "w") as f:
        json.dump(class_names, f)

    print(f"\nBest val accuracy: {best_acc:.4f}")
    print(f"Saved model to {args.out}")


if __name__ == "__main__":
    main()
