import { connect } from "react-redux";
import {State} from "../../reducers";
import { withRouter } from "react-router-dom";
import {getAuthUser} from "../../selectors/Authentification/auth";
import {getPictureComments} from "../../selectors/Comment/Comment";
import Comments from "../../components/Comment/Comment";
const mapStateToProps = (state: State, ownProps : any) => ({
    user: getAuthUser(state),
    comments: getPictureComments(state),
    picture : ownProps.picture
});

const mapDispatchToProps = {
};

export default withRouter(connect<any, any, any>(mapStateToProps, mapDispatchToProps)(Comments));
