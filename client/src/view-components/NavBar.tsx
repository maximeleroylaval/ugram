import * as React from 'react'
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

interface Props {
}
interface State {
    isOpen: boolean
}
import {Link} from 'react-router-dom';
import {Divider, Grid, Icon} from "@material-ui/core";


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
        return (
            <AppBar position="fixed" style={{backgroundColor: "#ffffff", borderBottom: "1px solid rgba(0,0,0,.0975)"}} elevation={0}>
                <Toolbar>
                    <Grid container alignItems="center">
                        <Grid item xs>
                            <Grid container alignItems="center">
                                <Link to={"/"}>
                                    <img className={"logo"} src="https://s3.ca-central-1.amazonaws.com/ugram-team02/assets/header-picture.png" alt="Logo UGRAM" />
                                </Link>
                                <Divider />
                            </Grid>
                        </Grid>
                        <Grid item className={"header-nav"}>
                            <Grid container justify="flex-end">
                                <Link to={"/users/"}><Icon >explore_outlined</Icon></Link>
                                <Icon >favorite_border_rounded</Icon>
                                <Link to={"/profil/team02"}><Icon>person_outlined</Icon></Link>
                            </Grid>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        );
    }
}

export default (NavBar);