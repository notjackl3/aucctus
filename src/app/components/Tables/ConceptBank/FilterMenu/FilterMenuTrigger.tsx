import { Icon } from '@components';
import * as Menubar from '@radix-ui/react-menubar';
import classNames from 'classnames';
import React from 'react';

interface ISubMenuTriggerProps {
  label: string;
  icon: IconVariant;
}

const SubMenuTrigger: React.FC<ISubMenuTriggerProps> = ({
  label,
  icon = 'arrowleft',
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  // const [isOpen, setIsOpen] = useState(false);

  // useEffect(() => {
  //   const targetNode = ref.current;

  //   if (!targetNode) return;

  //   const observer = new MutationObserver(() => {
  //     const state = targetNode.getAttribute('data-state');
  //     setIsOpen(state === 'open');
  //   });

  //   observer.observe(targetNode, { attributes: true, attributeFilter: ['data-state'] });

  //   // Initial state check
  //   const initialState = targetNode.getAttribute('data-state');
  //   setIsOpen(initialState === 'open');

  //   return () => {
  //     observer.disconnect();
  //   };
  // }, []);

  return (
    <Menubar.SubTrigger
      ref={ref}
      className={classNames([
        'group',
        'inline-flex h-[38px] items-center justify-start gap-3 rounded-md px-2.5 py-[9px]',
        'hover:outline-none focus:outline-none focus-visible:outline-none',
      ])}
    >
      <div
        className={classNames(
          'flex h-5 shrink grow basis-0 items-center justify-start gap-2 text-sm font-medium text-tertiary-700 group-hover:font-bold [&>svg]:stroke-tertiary-700',
        )}
      >
        {icon ? <Icon variant={icon} /> : null}

        {label}
      </div>
    </Menubar.SubTrigger>
  );
};

export default SubMenuTrigger;
