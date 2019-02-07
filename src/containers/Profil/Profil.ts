import { connect } from 'react-redux'
import Profil, {Props} from "../../components/Profil/Profil";
import {getMessageError, getStatusProfil, getUserProfil} from "../../selectors/Profil/Profil";
import {State} from "../../reducers";
import {profilData} from "../../actions/Profil/profil";
import { withRouter } from 'react-router-dom';
import {getAuth, getAuthUser} from "../../selectors/Authentification/auth";
import {getPictures} from "../../selectors/Picture/Picture";
import {getPictureForProfil, reset} from "../../actions/Picture/picture";
const mapStateToProps = (state: State) => ({
    user: getUserProfil(state),
    status: getStatusProfil(state),
    isAuthenticated: getAuth(state),
    userid: getAuthUser(state).id,
    pictures:getPictures(state),
    message: getMessageError(state)
});

const mapDispatchToProps = {
    getProfil: profilData,
    getPicture: getPictureForProfil,
    reset: reset
};

export default withRouter(connect<any, any, any>(mapStateToProps, mapDispatchToProps)(Profil))
