import PropTypes from 'prop-types';

const SubHeading = ({ label }) => {
    return (
        <div className="text-slate-500 text-md pt-1 px-4 pb-4">
            {label}
        </div>
    );
};

SubHeading.propTypes = {
    label: PropTypes.string.isRequired
};

export default SubHeading;