"""
Evaluate a trained model with a full confusion matrix, not just overall accuracy.

Usage:
    python evaluate.py --model model.pt --data_dir deity_dataset
"""

import argparse

import torch
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, models, transforms


def build_val_loader(data_dir, class_names, batch_size=16, val_split=0.2, img_size=224):
    val_tf = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(img_size),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    full_dataset = datasets.ImageFolder(data_dir, transform=val_tf)
    n_val = max(1, int(len(full_dataset) * val_split))
    n_train = len(full_dataset) - n_val
    # Same seed as train.py so this reproduces the same validation split
    _, val_subset = random_split(full_dataset, [n_train, n_val],
                                  generator=torch.Generator().manual_seed(42))
    return DataLoader(val_subset, batch_size=batch_size, shuffle=False)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True)
    parser.add_argument("--data_dir", required=True)
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    checkpoint = torch.load(args.model, map_location=device)
    class_names = checkpoint["class_names"]

    model = models.resnet50(weights=None)
    model.fc = torch.nn.Sequential(
        torch.nn.Dropout(0.5),
        torch.nn.Linear(model.fc.in_features, len(class_names)),
    )
    model.load_state_dict(checkpoint["model_state"])
    model.to(device)
    model.eval()

    val_loader = build_val_loader(args.data_dir, class_names)

    n = len(class_names)
    matrix = [[0] * n for _ in range(n)]

    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            preds = model(images).argmax(dim=1)
            for true_label, pred_label in zip(labels.cpu().tolist(), preds.cpu().tolist()):
                matrix[true_label][pred_label] += 1

    # Print confusion matrix
    col_width = max(len(c) for c in class_names) + 2
    header = " " * (col_width + 10) + "predicted ->"
    print(header)
    print(" " * (col_width + 4) + "".join(f"{c:>{col_width}}" for c in class_names))
    for i, row_name in enumerate(class_names):
        row_str = "".join(f"{matrix[i][j]:>{col_width}}" for j in range(n))
        print(f"true {row_name:<{col_width-5}}{row_str}")

    print("\nPer-class precision / recall:")
    for i, name in enumerate(class_names):
        true_positive = matrix[i][i]
        actual_total = sum(matrix[i])  # row sum = actual count
        predicted_total = sum(matrix[r][i] for r in range(n))  # col sum = predicted count
        recall = true_positive / actual_total if actual_total else 0.0
        precision = true_positive / predicted_total if predicted_total else 0.0
        print(f"  {name}: precision={precision:.2f}  recall={recall:.2f}  (n={actual_total})")

    # Most confused pairs
    print("\nBiggest confusions (true -> predicted, count):")
    confusions = []
    for i in range(n):
        for j in range(n):
            if i != j and matrix[i][j] > 0:
                confusions.append((matrix[i][j], class_names[i], class_names[j]))
    confusions.sort(reverse=True)
    for count, true_name, pred_name in confusions[:8]:
        print(f"  {true_name} misclassified as {pred_name}: {count} times")


if __name__ == "__main__":
    main()
