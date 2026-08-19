"""
Import external folder containing dataset images into deity_dataset.

Usage:
    # 1. If your folder is images for a single deity (e.g. C:\Downloads\ganesha_photos):
    python import_dataset.py "C:\path\to\folder" --class_name ganesha

    # 2. If your folder already contains subfolders (e.g. C:\Downloads\my_dataset\ganesha, C:\Downloads\my_dataset\hanuman):
    python import_dataset.py "C:\path\to\my_dataset"
"""

import argparse
import os
import shutil

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
TARGET_DIR = "deity_dataset"


def import_single_class_folder(src_folder, class_name):
    class_name = class_name.lower().strip()
    dest_dir = os.path.join(TARGET_DIR, class_name)
    os.makedirs(dest_dir, exist_ok=True)

    existing_count = len([f for f in os.listdir(dest_dir) if not f.startswith(".")])
    copied = 0

    for root, _, files in os.walk(src_folder):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in VALID_EXTENSIONS:
                new_filename = f"{class_name}_{existing_count + copied:04d}{ext}"
                src_path = os.path.join(root, file)
                dest_path = os.path.join(dest_dir, new_filename)
                shutil.copy2(src_path, dest_path)
                copied += 1

    print(f"Successfully imported {copied} images into '{dest_dir}'. Total now: {existing_count + copied} images.")


def main():
    parser = argparse.ArgumentParser(description="Import external images into deity_dataset")
    parser.add_argument("src_path", help="Path to folder containing images or subfolders")
    parser.add_argument("--class_name", help="Name of deity class if src_path contains images directly for 1 class")
    args = parser.parse_args()

    src = os.path.abspath(args.src_path)

    if not os.path.exists(src):
        print(f"Error: Path '{src}' does not exist.")
        return

    # Check if src has subdirectories
    subdirs = [d for d in os.listdir(src) if os.path.isdir(os.path.join(src, d)) and not d.startswith(".")]

    if args.class_name:
        import_single_class_folder(src, args.class_name)
    elif subdirs:
        print(f"Found subdirectories: {subdirs}")
        for d in subdirs:
            subdir_path = os.path.join(src, d)
            import_single_class_folder(subdir_path, d)
    else:
        # Default class name to folder basename if not specified
        folder_name = os.path.basename(src).lower()
        print(f"No subfolders found. Importing files directly under class name '{folder_name}'...")
        import_single_class_folder(src, folder_name)


if __name__ == "__main__":
    main()
