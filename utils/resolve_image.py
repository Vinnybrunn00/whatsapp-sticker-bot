import cv2
import pytesseract
import os

image = cv2.imread('./image.png')

text = pytesseract.image_to_string(image)

print(text)

