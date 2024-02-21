import { FunctionComponent, useState } from 'react';
import IgniteForm from '../components/IgniteForm';
import styles from '../assets/styles/pages/ignite.module.scss';
import TextArea from '../components/TextArea';
import { useQuery } from 'react-query';
import api from '../../libs/api';
import IgniteLoading from '../components/IgniteLoading';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../routes/routes';

const IgniteDomain: FunctionComponent = () => {
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<string>('');
  const [perception, setPerception] = useState<string>('');
  const [qualification, setQualification] = useState<string>('');
  const [exampleConcepts, setExampleConcepts] = useState<string>('');
  const [extraDetails, setExtraDetails] = useState<string>('');

  const query = useQuery({
    queryKey: 'igniteDomain',
    enabled: false, // disable this query from automatically running
    // queryFn: async () =>
    //   await api.igniteDomain.generateDomain({ opportunity, perception, qualification, exampleConcepts, extraDetails }),
    // onSuccess: (response) => {
    //   navigate(AppPath.DomainList);
    // },
  });

  return (
    <div className={styles.ignite}>
      {query.isLoading ? (
        <IgniteLoading title="Igniting Your Domain" subtitle="Ideating can take a moment. Please wait a minute." />
      ) : (
        <IgniteForm title="Ignite Your Domain" subtitle="These answers will kick start your domain generation process">
          <TextArea
            name="opportunity"
            label="What opportunity area are you looking to explore?"
            placeholder="I want to explore how my organization can create value in the healthcare space."
            value={opportunity}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOpportunity(e.target.value)}
          />

          <TextArea
            name="perception"
            label="Why do you believe there is opportunity in this area?"
            placeholder="Consumers looking to get healthcare services at home. It would likely be a pay for service model."
            value={perception}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPerception(e.target.value)}
          />

          <TextArea
            name="qualification"
            label="Why is your organization equipped to provide value in this area?"
            placeholder="Telus has launched Telus Health, many other organizations are exploring it such as Loblaws."
            value={qualification}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setQualification(e.target.value)}
          />

          <TextArea
            name="exampleConcepts"
            label="Whats an example of specific concepts your organization could offer?"
            placeholder="Much of Healthcare services can be provided digitally. One example is to offer tele-medicine."
            value={exampleConcepts}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setExampleConcepts(e.target.value)}
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
            disabled={!opportunity || !perception || !qualification || !exampleConcepts || !extraDetails}
            onClick={() => query.refetch()}
          >
            Generate Domains
          </button>
        </IgniteForm>
      )}
    </div>
  );
};

export default IgniteDomain;
