import * as React from 'react'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
interface Props {
    classes: PropTypes.object.isRequired
}
interface State {
    isOpen: boolean
}
import {Link} from 'react-router-dom';
import {Divider, Grid, Hidden, Icon, InputAdornment, TextField} from "@material-ui/core";
import {Search} from "@material-ui/icons";

const styles = {
    root: {
        flexGrow: 1,
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
};

class NavBar extends React.Component<Props,State> {
    constructor(props : Props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false
        };
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }
    render() {
        const {classes} = this.props;
        return (
            <div style={{paddingBottom:20}}>
                <AppBar position="sticky" color="default" elevation={0}>
                    <Toolbar>
                        <Grid container alignItems="center">
                            <Grid item xs>
                                <Grid container alignItems="center">
                                    <Link to={"/"}>UGRAM</Link>
                                    <Divider />
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Grid container justify="flex-end">
                                    <Link to={"/users/"}><Icon >explore_outlined</Icon></Link>
                                    <Icon >favorite_border_rounded</Icon>
                                    <Link to={"/profil/team02"}><Icon>person_outlined</Icon></Link>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Toolbar>
                </AppBar>
            </div>
        );
    }
}

export default withStyles(styles)(NavBar);
