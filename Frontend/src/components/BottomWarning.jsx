import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const BottomWarning = ({ label, buttonText, to }) => {
    return (
        <div className="py-2 text-sm flex justify-center">
            <div className="text-gray-600">
                {label}
            </div>
            <Link 
                className="pointer underline pl-1 cursor-pointer text-blue-600 hover:text-blue-800"
                to={to}
                role="link" // Better accessibility
            >
                {buttonText}
            </Link>
        </div>
    );
};

BottomWarning.propTypes = {
    label: PropTypes.string.isRequired,
    buttonText: PropTypes.string.isRequired,
    to: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            pathname: PropTypes.string,
            search: PropTypes.string,
            hash: PropTypes.string,
            state: PropTypes.object
        })
    ]).isRequired
};

BottomWarning.defaultProps = {
    label: '',
    buttonText: '',
    to: '/'
};

export default BottomWarning;