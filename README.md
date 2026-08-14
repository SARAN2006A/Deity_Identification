# Murugan / Amman / Perumal / Shivan classifier

A transfer-learning image classifier (ResNet50 backbone) for the four deity classes.
Tested end-to-end on synthetic data with random weights to confirm the pipeline runs
without errors — you'll get real accuracy once trained on real images with real
pretrained weights.

## Setup

```bash
pip install torch torchvision pillow
```

## 1. Prepare your data

Use the Wikimedia scraper from before (or your own photos) to build this structure:

```
deity_dataset/
    murugan/    murugan_0001.jpg  murugan_0002.jpg  ...
    amman/      amman_0001.jpg    ...
    perumal/    perumal_0001.jpg  ...
    shivan/     shivan_0001.jpg   ...
```

Aim for at least 150-200 images per class before training seriously.

## 2. Train

```bash
python train.py --data_dir deity_dataset --epochs 15 --batch_size 16 --out model.pt
```

This will:
- Split your data 80/20 into train/validation automatically
- Apply data augmentation (crop, flip, color jitter, rotation) to the training set
- Start by training only the classification head (backbone frozen) for the first
  5 epochs, then unfreeze the full ResNet50 for fine-tuning at a lower learning rate
  (adjustable with `--unfreeze_after`)
- Weight the loss function to handle class imbalance automatically (common in this
  domain — Shiva/lingam images are typically far more numerous than Murugan images)
- Print per-class accuracy every epoch so you can see exactly where confusion happens
- Save the best-validation-accuracy checkpoint to `model.pt`

On the first run, torchvision will download ImageNet-pretrained ResNet50 weights
automatically (needs internet access on your machine — this works outside sandboxed
environments).

## 3. Predict on a new image

```bash
python predict.py --model model.pt --image path/to/new_photo.jpg
```

Outputs a ranked probability for each class, e.g.:

```
Predictions for path/to/new_photo.jpg:
  shivan: 78.3%
  perumal: 12.1%
  amman: 7.2%
  murugan: 2.4%

Best guess: shivan (78.3% confidence)
```

## Expected accuracy

Based on comparable studies (500-800 images, 2-5 classes, ResNet50/EfficientNet
transfer learning), expect roughly 85-94% overall accuracy once you have a clean,
sufficiently-sized dataset. Confusion is most likely to show up between subforms
within a deity (e.g. Amman variants, or Perumal avatars) rather than between the
four main classes, which are visually quite distinct.

## Next steps once this works

- Add subform-level labels (Nataraja vs. lingam vs. Dakshinamurthy within `shivan/`,
  for instance) as separate subfolders/classes once you have enough volume per subform
- Combine with the rule-based iconographic checklist as an ensemble, especially useful
  while your dataset is still small
- Track a confusion matrix (not just overall accuracy) to see exactly which pairs of
  classes/subforms are being mixed up
