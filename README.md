# WaktuMain: PS Rental Calculator

[cloudflarebutton]

A sleek and modern calculator for PlayStation rental businesses to compute charges and track rental history effortlessly.

WaktuMain is a visually stunning and highly efficient single-page web application designed for PlayStation rental businesses. It provides a simple interface to calculate rental costs based on start time, end time, and an hourly rate. The application features a clean, dark-themed UI with a vibrant accent color, ensuring excellent readability and a modern aesthetic.

## Key Features

-   **Precise Calculation**: Accurately computes rental duration and total cost.
-   **Overnight Support**: Seamlessly handles rentals that cross midnight.
-   **Persistent History**: Automatically saves all transactions to the browser's local storage.
-   **History Management**: View all past rentals in a clean table and clear the entire history with a single click.
-   **Modern UI**: Aesthetically pleasing dark theme with a focus on user experience.
-   **Fully Responsive**: Flawless performance on desktops, tablets, and mobile devices.

## Technology Stack

-   **Frontend**: React, Vite, TypeScript
-   **Styling**: Tailwind CSS, shadcn/ui
-   **State Management**: Zustand
-   **UI/UX**: Framer Motion, Lucide React, Sonner (Toasts)
-   **Deployment**: Cloudflare Workers

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for deployment.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd waktumain-ps-rental-calculator
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

### Running Locally

To start the development server, run the following command:

```sh
bun run dev
```

The application will be available at `http://localhost:3000`.

## Usage

The application is designed for simplicity and efficiency:

1.  **Enter Start Time**: Input the time the rental period begins (e.g., `20.30`).
2.  **Enter End Time**: Input the time the rental period ends (e.g., `23.45`).
3.  **Enter Hourly Rate**: Provide the rental cost per hour.
4.  **Calculate**: Click the "Hitung" (Calculate) button.
5.  **View Result**: The total duration and price will be displayed instantly.
6.  **Check History**: The new calculation is automatically added to the "Riwayat" (History) table for your records.
7.  **Clear History**: To clear all saved records, click the "Hapus Riwayat" (Delete History) button.

## Deployment

This project is configured for easy deployment to Cloudflare Workers.

1.  **Login to Wrangler:**
    If you haven't already, authenticate with your Cloudflare account.
    ```sh
    wrangler login
    ```

2.  **Deploy the application:**
    Run the deploy script, which builds the project and deploys it.
    ```sh
    bun run deploy
    ```

Alternatively, you can deploy your own version of this project with a single click.

[cloudflarebutton]

## License

This project is licensed under the MIT License.