import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Garanta que os caminhos dos seus arquivos estão corretos aqui!
  ],
  theme: {
    extend: {
      colors: {
        'primary-color': 'var(--primary-color)',
        'background': 'var(--background)',
        'secondary-color': 'var(--secondary-color)',
      },
    },
  },
  plugins: [],
}

export default config
