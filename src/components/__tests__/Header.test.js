import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';

// Mock react-icons
jest.mock('react-icons/fi', () => ({
    FiSun: () => <div data-testid="sun-icon" />,
    FiMoon: () => <div data-testid="moon-icon" />,
    FiMusic: () => <div data-testid="music-icon" />,
    FiInfo: () => <div data-testid="info-icon" />,
    FiStar: () => <div data-testid="star-icon" />,
}));

// Mock UserProfile component
jest.mock('../UserProfile', () => {
    return function UserProfile() {
        return <div data-testid="user-profile">User Profile</div>;
    };
});

describe('Header Component', () => {
    const mockProps = {
        darkMode: false,
        toggleDarkMode: jest.fn(),
        toggleMusic: jest.fn(),
        startTutorial: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the header with WordPied title', () => {
        render(<Header {...mockProps} />);
        expect(screen.getByText('WordPied')).toBeInTheDocument();
    });

    it('renders the Beta badge', () => {
        render(<Header {...mockProps} />);
        expect(screen.getByText('Beta')).toBeInTheDocument();
    });

    it('renders all control buttons', () => {
        render(<Header {...mockProps} />);
        expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
        expect(screen.getByLabelText('Toggle music')).toBeInTheDocument();
        expect(screen.getByLabelText('Favorites')).toBeInTheDocument();
        expect(screen.getByLabelText('Show tutorial')).toBeInTheDocument();
    });

    it('renders UserProfile component', () => {
        render(<Header {...mockProps} />);
        expect(screen.getByTestId('user-profile')).toBeInTheDocument();
    });

    it('calls toggleDarkMode when theme button is clicked', () => {
        render(<Header {...mockProps} />);
        const themeButton = screen.getByLabelText('Toggle theme');
        fireEvent.click(themeButton);
        expect(mockProps.toggleDarkMode).toHaveBeenCalledTimes(1);
    });

    it('calls toggleMusic when music button is clicked', () => {
        render(<Header {...mockProps} />);
        const musicButton = screen.getByLabelText('Toggle music');
        fireEvent.click(musicButton);
        expect(mockProps.toggleMusic).toHaveBeenCalledTimes(1);
    });

    it('calls startTutorial when tutorial button is clicked', () => {
        render(<Header {...mockProps} />);
        const tutorialButton = screen.getByLabelText('Show tutorial');
        fireEvent.click(tutorialButton);
        expect(mockProps.startTutorial).toHaveBeenCalledTimes(1);
    });

    it('shows moon icon when in light mode', () => {
        render(<Header {...mockProps} darkMode={false} />);
        expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    });

    it('shows sun icon when in dark mode', () => {
        render(<Header {...mockProps} darkMode={true} />);
        expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    });
});
