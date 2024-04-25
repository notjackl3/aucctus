import { useCallback, useState } from 'react';
import { IMarketSizeMetric } from '../../../../libs/api/types';
import { useModal } from '../../../context/modal/ModalContextProvider';
import Icon from '../../Icons/Icon/Icon';
import InputField from '../../Text/InputField/InputField';
import TextArea from '../../Text/TextArea/TextArea';
import styles from './market-size-metric-edit-modal.module.scss';
import { useMarketMetricSizeUpdate } from '../../../hooks/query/concepts.hook';
import { getMarketMetricTitle } from '../../../../libs/concepts';

interface IMarketSizeMetricEditModalProps {
  conceptUuid: string;
  metric: IMarketSizeMetric;
}

const REASON_MAX_LENGTH = 500;
const DATA_POINT_MAX_LENGTH = 255;

const formatNumber = (num: number) => {
  // Ensure num is a number and format it, otherwise return empty string
  return num.toLocaleString('en-US', {
    maximumFractionDigits: 0, // Ensure no fractional digits in the formatted output
  });
};

const MarketSizeMetricEditModal: React.FC<IMarketSizeMetricEditModalProps> = ({ metric, conceptUuid }) => {
  const { closeModal } = useModal();
  const { mutate } = useMarketMetricSizeUpdate(conceptUuid);
  const [value, setValue] = useState(() => formatNumber(metric.value));
  const [valueError, setValueError] = useState<string | undefined>();
  const [reason, setReason] = useState(metric.reason);
  const [dataPoint, setDataPoint] = useState(metric.dataPoint);
  const [reasonError, setReasonError] = useState<string | undefined>();
  const [dataPointError, setDataPointError] = useState<string | undefined>();

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value.replace(/,/g, ''); // Remove commas for processing
      const numericValue = parseInt(inputValue, 10);

      setValueError(undefined); // Reset the error state whenever the input changes

      if (!inputValue) {
        setValue('');
      } else if (isNaN(numericValue)) {
        setValueError('Value must be a valid number.');
        setValue('');
      } else {
        if (numericValue < 0) {
          setValueError('Value must be a positive number.');
        } else {
          setValue(formatNumber(numericValue));
        }
      }
    },
    [setValue, setValueError]
  );

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    if (input.length < REASON_MAX_LENGTH) {
      setReason(input);
      setReasonError(undefined);
    } else {
      setReasonError('Reason exceeds the maximum allowed length.');
    }
  };

  const handleDataPointChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    if (input.length < DATA_POINT_MAX_LENGTH) {
      setDataPoint(input);
      setDataPointError(undefined);
    } else {
      setDataPointError('Data point description exceeds the maximum allowed length.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{getMarketMetricTitle(metric.metricType)}</h1>
        <button
          className={styles.closeButton}
          onClick={() => {
            closeModal();
          }}
        >
          <Icon variant={'closeX'} />
        </button>
      </div>
      <div className={styles.content}>
        <InputField
          label={'Value'}
          name={'value'}
          value={value}
          error={!!valueError}
          errorMessage={valueError}
          onChange={handleValueChange}
        />
        <TextArea
          label={'Reason'}
          name={'reason'}
          value={reason}
          error={!!reasonError}
          errorMessage={reasonError}
          onChange={handleReasonChange}
          maxLength={REASON_MAX_LENGTH}
        />
        <TextArea
          label={'Data Point'}
          name={'data-point'}
          value={dataPoint}
          error={!!dataPointError}
          errorMessage={dataPointError}
          onChange={handleDataPointChange}
          maxLength={DATA_POINT_MAX_LENGTH}
        />
      </div>
      <div className={styles.actions}>
        <button
          aria-label={`Cancel Editing `}
          className={`btn btn-light`}
          onClick={(e) => {
            e.preventDefault();
            closeModal();
            e.stopPropagation();
          }}
        >
          Cancel
        </button>
        <button
          aria-label="Save "
          className={`btn btn-primary`}
          disabled={!!valueError || !!reasonError || !!dataPointError}
          onClick={(e) => {
            mutate(
              {
                ...metric,
                value: parseInt(value.replace(/,/g, ''), 10),
                reason,
                dataPoint,
              },
              {
                onSuccess: () => {
                  closeModal();
                },
              }
            );
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default MarketSizeMetricEditModal;
