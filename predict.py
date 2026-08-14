"""
Classify a single sculpture image using a model trained by train.py.

Usage:
    python predict.py --model model.pt --image path/to/photo.jpg
"""

import argparse
import json

import torch
import torch.nn.functional as F
import os
from PIL import Image
from torchvision import models, transforms


def load_model(model_path, device):
    checkpoint = torch.load(model_path, map_location=device)
    class_names = checkpoint["class_names"]
    model = models.resnet50(weights=None)
    model.fc = torch.nn.Sequential(
        torch.nn.Dropout(0.5),
        torch.nn.Linear(model.fc.in_features, len(class_names)),
    )
    model.load_state_dict(checkpoint["model_state"])
    model.to(device)
    model.eval()
    return model, class_names


def preprocess(image_path, img_size=224):
    tf = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(img_size),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    import sys
    if not os.path.isfile(image_path):
        print(f"Error: Image file '{image_path}' not found.")
        sys.exit(1)
    image = Image.open(image_path).convert("RGB")
    return tf(image).unsqueeze(0)


def predict(model, class_names, image_tensor, device):
    with torch.no_grad():
        image_tensor = image_tensor.to(device)
        outputs = model(image_tensor)
        probs = F.softmax(outputs, dim=1)[0]
    ranked = sorted(zip(class_names, probs.cpu().tolist()), key=lambda x: x[1], reverse=True)
    return ranked


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True)
    parser.add_argument("--image", required=True)
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model, class_names = load_model(args.model, device)
    image_tensor = preprocess(args.image)
    ranked = predict(model, class_names, image_tensor, device)

    print(f"\nPredictions for {args.image}:")
    for name, prob in ranked:
        print(f"  {name}: {prob*100:.1f}%")

    top_name, top_prob = ranked[0]
    print(f"\nBest guess: {top_name} ({top_prob*100:.1f}% confidence)")


if __name__ == "__main__":
    main()
