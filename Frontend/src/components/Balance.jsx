import PropTypes from 'prop-types';

const Balance = ({ value }) => {
    // Format the value with commas for thousands
    const formattedValue = typeof value === 'number' 
        ? value.toLocaleString('en-IN') 
        : value;

    return (
        <div className="flex items-baseline">
            <div className="font-bold text-lg mr-2">
                Your balance:
            </div>
            <div className="font-semibold text-lg text-green-600">
                ₹{formattedValue}
            </div>
        </div>
    );
};

Balance.propTypes = {
    /** The balance amount (number or string) */
    value: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]).isRequired
};

Balance.defaultProps = {
    value: 0
};

export default Balance;