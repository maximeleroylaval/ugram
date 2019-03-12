import { connect } from 'react-redux'
import { getUserProfil} from "../../selectors/Profil/Profil";
import {State} from "../../reducers";
import {editUser} from "../../actions/Profil/profil";
import {withRouter} from 'react-router-dom';
import EditProfil from "../../components/Profil/EditProfil";
const mapStateToProps = (state: State) => ({
    profil: getUserProfil(state),
});

const mapDispatchToProps = {
    editUser: editUser,
};

export default withRouter(connect<any, any, any>(mapStateToProps, mapDispatchToProps)(EditProfil))