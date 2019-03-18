import { connect } from 'react-redux'
import { getUserProfil} from "../../selectors/Profil/Profil";
import {State} from "../../reducers";
import {deleteUser, editUser} from "../../actions/Profil/profil";
import {withRouter} from 'react-router-dom';
import EditProfil from "../../components/Profil/EditProfil";
import Props from "../../Props/Profil";
const mapStateToProps = (state: State, ownProps: Props) => ({
    profil: getUserProfil(state),
    cookies: ownProps.cookies
});

const mapDispatchToProps = {
    editUser: editUser,
    deleteUser: deleteUser
};

export default withRouter(connect<any, any, any>(mapStateToProps, mapDispatchToProps)(EditProfil))
