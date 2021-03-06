import { connect } from "react-redux";
import {State} from "../../reducers";
import { withRouter } from "react-router-dom";
import PictureItem, {Props} from "../../components/Picture/PictureItem";
const mapStateToProps = (state: State, ownProps: Props) => ({
    picture: ownProps.picture,
    user: ownProps.user,
    isHome: ownProps.isHome
});

const mapDispatchToProps = {
};

export default withRouter(connect<any, any, any>(mapStateToProps, mapDispatchToProps)(PictureItem))
