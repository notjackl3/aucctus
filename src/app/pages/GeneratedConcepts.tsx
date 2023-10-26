import { Component, FunctionComponent } from "react";
import styles from "../assets/styles/pages/generated-concept.module.scss"
import ConceptTable from "../components/ConceptTable";


import DownloadIcon from '../assets/icons/Download'
import ArrowRight from '../assets/icons/ArrowRight'
import RefreshIcon from '../assets/icons/refresh.svg?react'
import { AppPath } from "../../routes/routes";
import NavigateButton from "../components/NavigateButton";
import { RootState } from "../store";
import { connect } from "react-redux";
import { Dispatch } from "@reduxjs/toolkit";
import { setConcepts } from "../../features/concepts/concept.slice";
import api from "../../libs/api";
import analytics from "../../libs/analytics";



interface Props {
  dispatch: Dispatch
  igniteId?: string
}
class GeneratedConcepts extends Component<Props> {

  async componentWillUnmount() {
    try {
      const igniteId = this.props.igniteId;
      if (igniteId) {
        await api.igniteConcept.deleteAllUnsavedGeneratedConcept(igniteId)
      }
    } catch (e) {
      analytics.debug(e)
    }

    // Clear the concepts anyway for the user
    this.props.dispatch(setConcepts([]))

  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.text}>
            <h3>Generated Concepts</h3>
            <span className={styles.supportingText}>
              From the list below, choose the top concepts that you want to keep and continue building on
            </span>
          </div>
          <div className={styles.actionable}>
            <button className="btn btn-light disabled">
              <DownloadIcon height={20} width={20} stroke="" />
              Export
            </button>
            <button className="btn btn-light disabled"><RefreshIcon height={20} width={20} stroke="" /> Generate more</button>

            <NavigateButton variant="primary" route={AppPath.ConceptList} >
              Continue
              <ArrowRight height={20} width={20} stroke="" />
            </NavigateButton>
          </div>
        </div>

        <ConceptTable />

      </div>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  igniteId: state.concepts.igniteId,
});


export default connect(mapStateToProps)(GeneratedConcepts)