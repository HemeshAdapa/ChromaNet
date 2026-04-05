from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
import uvicorn
from PIL import Image
import io
try:
    import torch
    import torch.nn as nn
    import torchvision.transforms as transforms

    # Define the AutoEncoder Generator Model (Simplified UNet/AutoEncoder structure)
    class ColorizationAutoEncoder(nn.Module):
        def __init__(self):
            super(ColorizationAutoEncoder, self).__init__()
            # Encoder
            self.encoder = nn.Sequential(
                nn.Conv2d(1, 64, kernel_size=4, stride=2, padding=1),
                nn.ReLU(inplace=True),
                nn.Conv2d(64, 128, kernel_size=4, stride=2, padding=1),
                nn.BatchNorm2d(128),
                nn.ReLU(inplace=True),
                nn.Conv2d(128, 256, kernel_size=4, stride=2, padding=1),
                nn.BatchNorm2d(256),
                nn.ReLU(inplace=True),
            )
            # Decoder
            self.decoder = nn.Sequential(
                nn.ConvTranspose2d(256, 128, kernel_size=4, stride=2, padding=1),
                nn.BatchNorm2d(128),
                nn.ReLU(inplace=True),
                nn.ConvTranspose2d(128, 64, kernel_size=4, stride=2, padding=1),
                nn.BatchNorm2d(64),
                nn.ReLU(inplace=True),
                nn.ConvTranspose2d(64, 3, kernel_size=4, stride=2, padding=1),
                nn.Tanh() # Output values between -1 and 1
            )

        def forward(self, x):
            features = self.encoder(x)
            out = self.decoder(features)
            return out

    # Initialize model
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = ColorizationAutoEncoder().to(device)
    # Note: For real world use, load trained weights here:
    # model.load_state_dict(torch.load("pretrained_weights.pth", map_location=device))
    model.eval()

    # Transforms
    transform_in = transforms.Compose([
        transforms.Grayscale(num_output_channels=1),
        transforms.Resize((128, 128)),
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,))
    ])

    def denormalize(tensor):
        tensor = tensor * 0.5 + 0.5
        return tensor.clamp(0, 1)

except ImportError:
    print("PyTorch not installed. Running in mock Cloud-Deployment mode API exclusively.")

app = FastAPI(title="Image Colorization API")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        from PIL import ImageOps
        import io
        
        # Read the uploaded image
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        original_size = image.size
        
        # --- MOCK COLORIZATION FOR DEMO PURPOSES ---
        # Since no PyTorch weights are loaded, we will use PIL to apply a 
        # beautiful duotone (dark purple to warm yellow) to simulate colorization!
        
        # 1. Convert back to grayscale to get intensity
        gray_image = image.convert("L")
        
        # 2. Map the monochrome intensities to a stylized color palette
        # Black areas will be dark purple, white areas will be a warm sunny yellow
        out_image = ImageOps.colorize(gray_image, black="#2d1b4e", white="#fcd34d", mid="#d97743")
        
        # 3. Ensure it's in RGB space for sending back
        out_image = out_image.convert("RGB")
        
        # Resize to original (though it already should be)
        if out_image.size != original_size:
            out_image = out_image.resize(original_size, Image.LANCZOS)
        
        # Convert to bytes for transmitting
        img_byte_arr = io.BytesIO()
        out_image.save(img_byte_arr, format='JPEG', quality=95)
        img_byte_arr.seek(0)
        
        return StreamingResponse(img_byte_arr, media_type="image/jpeg")

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
