
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '375px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1536px',
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Azure color palette (was navy)
				navy: {
					900: '#2C4A63', // Darkest azure
					800: '#3D5A78', // Medium dark azure
					700: '#4E6B8D', // Medium azure
					600: '#5691af', // Base azure (#5691af)
					500: '#6BA4C4', // Light azure
					400: '#89BBD6', // Lighter azure
					300: '#A7D2E8', // Very light azure
				},
				gold: {
					500: '#C8AA6E',
					400: '#D4BE87',
					300: '#E0D2A0',
				},
				// Theme system colors
				'theme-primary': {
					dark: 'hsl(var(--theme-primary-dark))',
					medium: 'hsl(var(--theme-primary-medium))',
				},
				'theme-accent': {
					DEFAULT: 'hsl(var(--theme-accent))',
					light: 'hsl(var(--theme-accent-light))',
				},
				// Modern theme colors
				'modern-sage': 'hsl(var(--modern-sage))',
				'modern-dusty-blue': 'hsl(var(--modern-dusty-blue))',
				'modern-cool-gray': 'hsl(var(--modern-cool-gray))',
				emergency: {
					DEFAULT: 'hsl(var(--emergency))',
					foreground: 'hsl(var(--emergency-foreground))',
				},
				alert: {
					DEFAULT: 'hsl(var(--alert))',
					foreground: 'hsl(var(--alert-foreground))',
				},
				missing: {
					DEFAULT: 'hsl(var(--missing))',
					foreground: 'hsl(var(--missing-foreground))',
				},
				mustard: {
					DEFAULT: 'hsl(var(--mustard))',
					foreground: 'hsl(var(--mustard-foreground))',
				},
				passport: {
					navy: '#2C4A63', // Updated to azure dark
					'light-navy': '#3D5A78', // Updated to azure medium
					gold: '#C8AA6E',
					white: '#F5F5F5',
					'section-bg': '#E8F1F8', // Updated to light azure-gray for sections
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				// Modern theme radius
				'modern-sm': 'var(--modern-radius-sm)',
				'modern': 'var(--modern-radius-md)',
				'modern-lg': 'var(--modern-radius-lg)',
				'modern-xl': 'var(--modern-radius-xl)',
			},
			fontFamily: {
				'serif': ['Playfair Display', 'Crimson Text', 'serif'],
				'passport': ['Crimson Text', 'serif'],
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
