import { FunctionComponent, useState } from "react";
import IgniteForm from "../components/IgniteForm";
import styles from '../assets/styles/pages/ignite.module.scss'
import TextArea from "../components/TextArea";
import { useQuery } from "react-query";
import api from "../../libs/api";
import IgniteLoading from "../components/IgniteLoading";
import { useAppDispatch } from "../hooks";
import { setConcepts } from "../../features/concepts/concept.slice"
import { useNavigate } from "react-router-dom";
import { AppPath } from "../../routes/routes";



const IgniteConcept: FunctionComponent = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [concept, setConcept] = useState<string>("")
  const [painPoint, setPainPoint] = useState<string>("")
  const [monetizationStrategy, setMonetizationStrategy] = useState<string>("")
  const [motivation, setMotivation] = useState<string>("")
  const [extraDetails, setExtraDetails] = useState<string>("")


  const query = useQuery({
    queryKey: "igniteDomain",
    cacheTime: 10,
    enabled: false, // disable this query from automatically running
    queryFn: async () => await api.igniteConcept.generateConcepts({ concept, painPoint, monetizationStrategy, motivation, extraDetails }),
    onSuccess: (response) => {
      dispatch(setConcepts(response))
      navigate(AppPath.GeneratedConcepts)
    }
  })


  return (
    <div className={styles.ignite} >

      {query.isLoading || query.isFetching ?

        <IgniteLoading
          title="Igniting Your Concept"
          subtitle="Ideating can take a moment. Please wait a minute."
        />

        :

        <IgniteForm
          title="Ignite Your Concept"
          subtitle="These answers will kick start your domain generation process"
        >

          <TextArea
            name="concept"
            label="Describe your idea in one sentence."
            placeholder="I want to explore how my organization can create value in the healthcare space. "
            value={concept}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setConcept(e.target.value)}
          />

          <TextArea
            name="paintPoint"
            label="What and who's pain point does it solve?"
            placeholder="Much of Healthcare services can be provided digitally. One example is to offer tele-medicine."
            value={painPoint}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPainPoint(e.target.value)}
          />

          <TextArea
            name="monetizationStrategy"
            label="How do you plan to monetize the idea?"
            placeholder="Telus has launched Telus Health, many other organizations are exploring it such as Loblaws."
            value={monetizationStrategy}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMonetizationStrategy(e.target.value)}
          />

          <TextArea
            name="motivation"
            label="Why is your organization competitive to create this product?"
            placeholder="Consumers looking to get healthcare services at home. It would likely be a pay for service model."
            value={motivation}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMotivation(e.target.value)}
          />

          <TextArea
            name="extraDetails"
            label="Could you share any other details about your strategy and competitive advantages in this area?"
            placeholder="We are a trusted brand that has done research showing we would be strong in healthcare."
            value={extraDetails}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setExtraDetails(e.target.value)}
          />

          <button
            className="btn btn-primary"
            disabled={!concept || !painPoint || !monetizationStrategy || !motivation || !extraDetails}
            onClick={() => query.refetch()}
          >
            Generate Concepts
          </button>

        </IgniteForm>
      }

    </div >
  )
}

export default IgniteConcept;