import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WritingBox from '../WritingBox';

// Mock Firebase
jest.mock('../../firebase', () => ({
    database: {},
}));

// Mock Firebase database functions
jest.mock('firebase/database', () => ({
    ref: jest.fn(),
    set: jest.fn(() => Promise.resolve()),
    onValue: jest.fn(),
    off: jest.fn(),
}));

// Mock Framer Motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
}));

describe('WritingBox Component', () => {
    const mockProps = {
        id: 'test-box-1',
        initialContent: 'Test content',
        onDelete: jest.fn(),
        onExpand: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with initial content', () => {
        render(<WritingBox {...mockProps} />);
        expect(screen.getByText(/Test content/i)).toBeInTheDocument();
    });

    it('renders box title', () => {
        render(<WritingBox {...mockProps} />);
        expect(screen.getByPlaceholderText(/Untitled/i)).toBeInTheDocument();
    });

    it('allows editing content', async () => {
        const user = userEvent.setup();
        render(<WritingBox {...mockProps} />);

        const textarea = screen.getByRole('textbox');
        await user.clear(textarea);
        await user.type(textarea, 'New content');

        expect(textarea).toHaveValue('New content');
    });

    it('calls onDelete when delete button is clicked', async () => {
        const user = userEvent.setup();
        render(<WritingBox {...mockProps} />);

        const deleteButton = screen.getByLabelText(/delete/i);
        await user.click(deleteButton);

        expect(mockProps.onDelete).toHaveBeenCalledWith(mockProps.id);
    });

    it('calls onExpand when expand button is clicked', async () => {
        const user = userEvent.setup();
        render(<WritingBox {...mockProps} />);

        const expandButton = screen.getByLabelText(/expand/i);
        await user.click(expandButton);

        expect(mockProps.onExpand).toHaveBeenCalledWith(mockProps.id);
    });

    it('displays character count', () => {
        render(<WritingBox {...mockProps} />);
        const characterCount = mockProps.initialContent.length;
        expect(screen.getByText(new RegExp(characterCount.toString()))).toBeInTheDocument();
    });
});
