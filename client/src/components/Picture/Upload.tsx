import * as React from 'react'
import {Link} from 'react-router-dom';
import {
    Button, FormControl, Icon, TextField, Grid, CircularProgress
} from "@material-ui/core";
import Picture from "../../models/Picture";
import User from "../../models/User";
import UploadModel from "../../models/Upload";
import PictureItem from "../../containers/Picture/PictureItem";

export interface Props{
    user: User,
    uploadPicture: (userId: string, file : File, model : UploadModel) => any,
    open: boolean
}
interface State {
    upload: UploadModel,
    file: File,
    fileUrl: string,
    picture : Picture,
    errorDescription: string,
    errorImage: string,
    loading: boolean
}



class Upload extends React.Component<Props,State> {

    constructor(props : Props) {
        super(props);

        this.state = {
            fileUrl: "",
            errorDescription: null,
            errorImage: null,
            loading: false,
            upload: {
                description: "",
                mentions: [],
                tags: [],
            },
            file: null,
            picture: {
                createdDate: 0,
                description: "",
                file: null,
                id: 0,
                mentions: [],
                tags: [],
                url: "",
                user: {},
                userId: ""
            }

        }
    }

    validate(picture: Picture = null) : boolean {
        let error = true;

        if (picture.url.length === 0) {
            this.setState({errorImage: "Merci de fournir une image"});
            error = false;
        }
        else {
            this.setState({errorImage: null});
        }

        if (picture.description.length === 0) {
            this.setState({errorDescription: "Merci d'indiquer une description"});
            error = false;
        }
        else {
            this.setState({errorDescription: null});
        }
        return error;
    }

    handleChangeMentions = (event) => {
        this.setState({
            picture: {
                ...this.state.picture,
                mentions: event.target.value.replace(/\s+/g,' ').trim().split(' ')
            },
            upload: {
                ...this.state.upload,
                mentions: event.target.value.replace(/\s+/g,' ').trim().split(' ')
            }
        });
    };

    handleChangeTags = (event) => {
        this.setState({
            picture: {
                ...this.state.picture,
                tags: event.target.value.replace(/\s+/g,' ').trim().split(' ')
            },
            upload: {
                ...this.state.upload,
                tags: event.target.value.replace(/\s+/g,' ').trim().split(' ')
            }
        });
    };

    handleChangeDescription = (event) => {
        this.setState({
            picture: {
                ...this.state.picture,
                description: event.target.value
            },
            upload: {
                ...this.state.upload,
                description: event.target.value
            }
        });
    };
    handleUploadFile = (file) => {
        if (file.length > 0) {
            this.state.picture.url = URL.createObjectURL(file[0]);

            this.setState({
                picture: {
                    ...this.state.picture,
                    url: URL.createObjectURL(file[0])
                },
                file: file[0]
            });

        }


    };
    handleUploadPicture = () => {
        if (this.validate(this.state.picture)) {
            this.setState({loading: true});
            this.props.uploadPicture(this.props.user.id, this.state.file, this.state.upload);
        }
    };

    componentWillReceiveProps(nextProps: Readonly<Props>, nextContext: any): void {
        if (nextProps.open) {
            this.setState({loading: false});
        }
    }

    render() {
        return (
            <Grid item>
                <FormControl className={"formUpload"}>
                    <Grid container direction="row" justify="center" alignItems="center">
                        <Grid container direction="row" justify="center" alignItems="center">
                            <TextField error={this.state.errorDescription !== null} helperText={this.state.errorDescription} label="Description" onChange={(e) => this.handleChangeDescription(e)}/>
                        </Grid>
                        <Grid container direction="row" justify="center" alignItems="center">
                            <TextField label="Mentions" onChange={(e) => this.handleChangeMentions(e)}/>
                        </Grid>
                        <Grid container direction="row" justify="center" alignItems="center">
                            <TextField label="Tags" onChange={(e) => this.handleChangeTags(e)}/>
                        </Grid>
                        <Grid container direction="row" justify="center" alignItems="center">
                            <label className={"uploadButton"}>
                                <p>Téléverser une image</p>
                                <Icon>cloud_upload</Icon>
                                <input type='file' onChange={(e) => this.handleUploadFile(e.target.files)} style={{ display: 'none'}}/>
                            </label>
                            {
                                this.state.errorImage &&
                                <Grid className={"error"} container direction="row" justify="center" alignItems="center">
                                    Merci de fournir une image à téléverser
                                </Grid>
                            }
                        </Grid>
                        <Grid container direction="row" justify="center" alignItems="center">
                                <Button variant="outlined" onClick={this.handleUploadPicture} >
                                    {
                                        this.state.loading &&
                                        <CircularProgress disableShrink /> ||

                                        'Valider'
                                    }

                                </Button>
                        </Grid>
                    </Grid>
                    <Grid container direction="row" justify="center" alignItems="center">
                        {
                            this.state.picture.url != "" &&
                            <PictureItem user={this.props.user} picture={this.state.picture} isHome={true}/>
                        }
                    </Grid>
                </FormControl>
            </Grid>

        );
    }
}
export default (Upload);
