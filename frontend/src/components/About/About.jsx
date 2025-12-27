import React from 'react';
import HeroSectionAbout from './HeroSectionAbout';
import HistorySection from './HistorySection';
import TeamSection from './TeamSection';
import MissionSection from './MissionSection';
import './About.scss';

const About = () => {
    return (
        <div className="about-page">
            <HeroSectionAbout />
            <HistorySection />
            <TeamSection />
            <MissionSection />
        </div>
    );
};

export default About;