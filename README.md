
# Canada Immigration Calculator & Eligibility Tracker

This project is a Next.js application that calculates your CRS (Comprehensive Ranking System) score for Canadian immigration and checks your eligibility against historical Express Entry draws (2023-2025).

## Features

- **CRS Score Calculator**: Estimates your score based on Age, Education, Language, and Work Experience.
- **Eligibility Checker**: Instantly checks if you would have received an Invitation to Apply (ITA) in the last 2 years based on your score and category.
- **Scenario Comparison**: Compare two profiles side-by-side (e.g., "French Speaker vs. High Skilled Professional") to see how different factors affect eligibility.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Draw Data

The application uses a seeded list of draws in `src/lib/draws.ts`. You can update this file with the latest draws from official sources.

## Disclaimer

This tool is for estimation and educational purposes only. It uses simplified logic for CRS calculation and does not guarantee accuracy compared to the official IRCC system.
