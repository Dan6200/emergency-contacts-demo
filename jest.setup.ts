// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.ts`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock environment variables if needed
// process.env.NEXT_PUBLIC_FB_API_KEY = 'mock-api-key';
// process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN = 'mock-auth-domain';
// ... add other necessary env vars

// Mock Firebase modules if they interfere with tests
jest.mock('./firebase/client/config', () => ({
	auth: {}, // Mock auth object or functions as needed
}));

jest.mock('./firebase/server/config', () => ({
	// Mock server config exports if needed
}));

jest.mock('next/navigation', () => ({
	useRouter: () => ({
		push: jest.fn(),
		back: jest.fn(),
		refresh: jest.fn(),
	}),
	usePathname: jest.fn(() => '/mock-path'),
	useSearchParams: jest.fn(() => ({
		get: jest.fn(),
	})),
	redirect: jest.fn(),
	notFound: jest.fn(),
}));

jest.mock('@vercel/analytics/react', () => ({
	Analytics: () => null, // Mock Analytics component
}));

// Mock other external dependencies or browser APIs if necessary
// For example, mocking fetch:
// global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({}) }));

