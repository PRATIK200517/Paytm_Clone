import PropTypes from 'prop-types';

const Button = ({ label, onClick, type = "button", disabled = false }) => {
    return (
        <button
            onClick={onClick}
            type={type}
            disabled={disabled}
            className={`w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
            {label}
        </button>
    );
};

Button.propTypes = {
    /** Text displayed on the button */
    label: PropTypes.string.isRequired,
    
    /** Click event handler */
    onClick: PropTypes.func,
    
    /** HTML button type attribute */
    type: PropTypes.oneOf(['button', 'submit', 'reset']),
    
    /** Disabled state of the button */
    disabled: PropTypes.bool
};

Button.defaultProps = {
    type: 'button',
    disabled: false,
    onClick: () => {} // Default empty function
};

export default Button;