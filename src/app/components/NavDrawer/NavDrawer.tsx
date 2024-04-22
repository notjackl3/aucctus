import React, { useMemo } from 'react';
import Logo from '../../assets/Logo.png';
import styles from '../../assets/styles/components/drawer.module.scss';
import NavLink from './NavLink';
import { logout } from '../../../features/auth/auth.slice';
import avatar from '../../assets/avatar.svg';
import { AppPath } from '../../../routes/routes';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../../libs/api';
import { useAppDispatch } from '../../store';
import { useUserDetails } from '../../hooks/query/account';

const NavDrawer = () => {
  const { data: { user } = { user: undefined } } = useUserDetails();
  const dispatch = useAppDispatch();

  const navigate = useNavigate();

  //TODO swap this query with more efficient endpoint to determine if any concepts are saved
  const { data } = useQuery({
    queryKey: ['concepts'],
    retry: 1,
    queryFn: async () => {
      return api.concept.getConcepts({});
    },
    staleTime: Infinity,
  });

  const isExistingConcepts = useMemo(() => {
    if (!data || !data.results) {
      return false;
    }
    return data.results.length > 0;
  }, [data]);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.navDrawer}>
          <div
            className={styles.header}
            onClick={() => {
              navigate(AppPath.Home);
            }}
          >
            <img alt="Logo" style={{ height: 30, width: 146 }} src={Logo} />
          </div>
          <div className={styles.content}>
            <NavLink to={AppPath.Home} title="Dashboard" icon="home" />

            <NavLink
              to={isExistingConcepts ? `${AppPath.ConceptCategory}?category=draft` : AppPath.IgniteConcept}
              title="Concepts"
              icon="lightbulb"
              openBasePath={AppPath.Concept}
              nestedRoutes={[
                {
                  title: 'Active',
                  to: `${AppPath.ConceptCategory}?category=active`,
                },
                {
                  title: 'Drafts',
                  to: `${AppPath.ConceptCategory}?category=draft`,
                },
                {
                  title: 'Archive',

                  to: `${AppPath.ConceptCategory}?category=archive`,
                },
              ]}
            />
            <NavLink to={AppPath.ChallengeCenter} title="Challenges" icon="rocket" />
          </div>
          <div className={styles.extras}>
            <NavLink to={AppPath.SettingsAbout} title="Settings" icon="file" />
          </div>
          <div className={styles.account}>
            <img className={styles.avatar} alt="avatar" src={avatar} />
            <div
              className={styles.userDetails}
              onClick={(e) => {
                e.preventDefault();
                dispatch(logout());
              }}
            >
              <span>{user?.firstName || ''}</span>
              <span>{user?.email || ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavDrawer;
