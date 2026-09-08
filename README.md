# Currency Converter

A modern, cross-platform currency conversion tool built with Astro, React, and Capacitor.

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/ErickRz21/currency-converter)
[![License](https://img.shields.io/badge/license-None-lightgrey)](https://github.com/ErickRz21/currency-converter/blob/main/LICENSE)
![Stars](https://img.shields.io/github/stars/ErickRz21/currency-converter?style=social)
![Forks](https://img.shields.io/github/forks/ErickRz21/currency-converter?style=social)

![example-preview-image](/preview_example.png)

## Features

*   **Blazing Fast Performance:** Leverages Astro's island architecture for optimal speed and a snappy user experience.
*   **Cross-Platform Compatibility:** Built with Capacitor, allowing seamless deployment to Android and other native platforms.
*   **Intuitive & Responsive UI:** A clean, modern interface powered by React and styled with Tailwind CSS, ensuring a great experience on any device.
*   **Real-time Conversion:** Provides up-to-date currency exchange rates for accurate conversions.
*   **Type-Safe Development:** Developed with TypeScript for robust, maintainable, and error-free code.

## Installation Guide

Follow these steps to get the Currency Converter up and running on your local machine.

### Prerequisites

Ensure you have Node.js (v16.x or higher) and npm (or yarn) installed. For Android development, you'll also need the Android SDK and Java Development Kit (JDK).

### 1. Clone the Repository

First, clone the `currency-converter` repository to your local machine:

```bash
git clone https://github.com/ErickRz21/currency-converter.git
cd currency-converter
```

### 2. Install Dependencies

Install all the required project dependencies using npm:

```bash
npm install
```

### 3. Run in Development Mode (Web)

To run the web version of the application in development mode:

```bash
npm run dev
```

This will start a local development server, usually accessible at `http://localhost:3000`.

### 4. Build for Production (Web)

To create a production-ready build for the web:

```bash
npm run build
```

The compiled assets will be located in the `dist` directory.

### 5. Setup for Android (Optional)

If you wish to run the application on an Android device or emulator:

#### Add Android Platform

```bash
npx cap add android
```

#### Build Web Assets

Ensure you have built the web application first:

```bash
npm run build
```

#### Sync Capacitor Project

Sync the web assets and Capacitor configuration to the Android project:

```bash
npx cap sync android
```

#### Open Android Studio

Open the Android project in Android Studio to build and run it on a device or emulator:

```bash
npx cap open android
```

### Basic Currency Conversion

1.  Select your source currency from the first dropdown.
2.  Enter the amount you wish to convert in the input field.
3.  Select your target currency from the second dropdown.
4.  The converted amount will be displayed automatically.

![currency-converter-usage-screenshot](/preview_example.png)
*A placeholder screenshot showing the currency conversion interface.*

## 📄 License Information

This project is currently released without a specific license. This means that, by default, all rights are reserved by the copyright holder, ErickRz21.

© 2026 ErickRz21. All rights reserved.
