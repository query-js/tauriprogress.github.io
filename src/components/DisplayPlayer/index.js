import React from "react";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import PlayerTitle from "./PlayerTitle";
import PlayerStats from "./PlayerStats";
import PlayerProgression from "./PlayerProgression";
import ErrorMessage from "../ErrorMessage";
import Loading from "../Loading";

import {
    playerSetError,
    playerSetLoading,
    playerFill
} from "../../redux/actions";

import { raidName } from "../../constants/currentContent";
import { serverUrl } from "../../constants/urls";

class DisplayPlayer extends React.PureComponent {
    componentDidMount() {
        const playerName = this.props.match.params.playerName;
        const realm = new URLSearchParams(this.props.location.search).get(
            "realm"
        );

        this.props.playerSetLoading(true);
        fetch(`${serverUrl}/getplayer`, {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                playerName: playerName,
                raidName: raidName,
                realm: realm
            })
        })
            .then(res => res.json())
            .then(res => {
                if (!res.success) {
                    throw new Error(res.errorstring);
                } else {
                    this.props.playerFill(res.response);
                }
            })
            .catch(err => this.props.playerSetError(err.message));
    }
    render() {
        const { data, loading, error } = this.props.player;

        return (
            <section className="displayPlayer">
                {loading && <Loading />}

                {error && <ErrorMessage message={error} />}
                {!loading && !error && data && (
                    <React.Fragment>
                        <PlayerTitle data={data} />
                        <div className="displayPlayerContentContainer">
                            <PlayerStats data={data} />
                            <PlayerProgression
                                data={data.progression}
                                raidBosses={this.props.raidBosses}
                            />
                        </div>
                    </React.Fragment>
                )}
            </section>
        );
    }
}

function mapStateToProps(state) {
    return {
        player: state.player,
        raidBosses: state.raids[0].encounters
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators(
        {
            playerSetError,
            playerSetLoading,
            playerFill
        },
        dispatch
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DisplayPlayer);
