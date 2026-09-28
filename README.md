# Cure AI — Ready-to-Upload Secure Backend Version

This package is designed for GitHub + Vercel.

## Architecture

Browser → `/api/chat` (Vercel serverless function) → Hugging Face Router → Qwen

The Hugging Face token is **not included in the frontend**.

## Deploy from phone

### 1. GitHub
Create a repository and upload **all files and folders from this ZIP**.

Important: upload the `api` folder too.

### 2. Vercel
Import the GitHub repository into Vercel and deploy it.

### 3. Add the secret
In Vercel:
Project → Settings → Environment Variables → Add New

Name:
`HF_TOKEN`

Value:
your Hugging Face token (`hf_...`)

Optional second variable:
Name: `HF_MODEL`
Value: `Qwen/Qwen3.8-27B:novita`

Select Production/Preview/Development as needed, then redeploy.

### 4. Do NOT add the token to GitHub
Do not put the token in `config.js`, `app.js`, `index.html`, or any public GitHub file.

## Model

The default frontend selection is:
`Qwen/Qwen3.8-27B:novita`

The model/provider identifier must be available to your Hugging Face Router account. If Hugging Face gives you a different exact model/provider identifier, change `HF_MODEL` in Vercel.

## Notes

- Chat history is stored locally in the user's browser.
- The file picker is included in the UI. This version sends the selected filename as a prompt; it does not upload file contents to the AI yet.
- Image and voice buttons are UI/voice-input helpers; image generation itself is not implemented by the text-chat endpoint.
- For a public production app, consider adding authentication and rate limiting to `/api/chat` to prevent abuse.
