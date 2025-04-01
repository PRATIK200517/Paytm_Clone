import PropTypes from 'prop-types';

const InputBox = ({ label, placeholder, onChange }) => {
    return (
        <div>
            <div className="text-sm font-medium text-left py-2">
                {label}
            </div>
            <input 
                onChange={onChange} 
                placeholder={placeholder} 
                className="w-full px-2 py-1 border rounded border-slate-200" 
            />
        </div>
    );
};

InputBox.propTypes = {
    /** Label text displayed above the input */
    label: PropTypes.string.isRequired,
    
    /** Placeholder text for the input */
    placeholder: PropTypes.string,
    
    /** onChange event handler */
    onChange: PropTypes.func.isRequired
};

InputBox.defaultProps = {
    placeholder: '' // Default empty placeholder if not provided
};

export default InputBox;