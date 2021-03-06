import { connect } from "react-redux";
import {State} from "../../../reducers";
import { withRouter } from "react-router-dom";
import {getAuthUser} from "../../../selectors/Authentification/auth";
import {getLoadComment, getPictureComments} from "../../../selectors/Picture/Comment/Comment";
import Comments from "../../../components/Picture/Comment/Comment";
import {deleteComment} from "../../../actions/Comment/comment";
const mapStateToProps = (state: State, ownProps : any) => ({
    user: getAuthUser(state),
    comments: getPictureComments(state),
    load: getLoadComment(state),
    picture : ownProps.picture
});

const mapDispatchToProps = {
    deleteComment : deleteComment
};

export default withRouter(connect<any, any, any>(mapStateToProps, mapDispatchToProps)(Comments));
