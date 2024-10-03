import * as THREE from 'three';
import { useMemo } from 'react'
import { OrbitParameters, KeplerianElements } from '../types'


    /*-------------------------------------------------------------*
        *   Utility functions for true, eccentric and mean anomalies  *
        *-------------------------------------------------------------*/
    function trueToEccentricAnomaly(e,f) {
        // http://mmae.iit.edu/~mpeet/Classes/MMAE441/Spacecraft/441Lecture19.pdf slide 7
        var eccentricAnomaly = 2* Math.atan(Math.sqrt((1-e)/(1+e))* Math.tan(f/2));

        return eccentricAnomaly ;
    }
    function meanToEccentricAnomaly (e, M) {
        // Solves for eccentric anomaly, E from a given mean anomaly, M
        // and eccentricty, e.  Performs a simple Newton-Raphson iteration
        // Code derived from Matlab scripts written by Richard Rieber, 1/23/2005
        // http://www.mathworks.com/matlabcentral/fileexchange/6779-calce-m
        var tol = 0.0001;  // tolerance
        var eAo = M;       // initialize eccentric anomaly with mean anomaly
        var ratio = 1;     // set ratio higher than the tolerance
        while (Math.abs(ratio) > tol) {
            var f_E = eAo - e * Math.sin(eAo) - M;
            var f_Eprime = 1 - e * Math.cos(eAo);
            ratio = f_E / f_Eprime;
            if (Math.abs(ratio) > tol) {
                eAo = eAo - ratio;
                // console.log ("ratio  " + ratio) ;
            }
            else
                eccentricAnomaly = eAo;
        }
        return eccentricAnomaly
    }
    function eccentricToTrueAnomaly(e, E) {
        // http://mmae.iit.edu/~mpeet/Classes/MMAE441/Spacecraft/441Lecture19.pdf slide 8
        var trueAnomaly = 2 * Math.atan(Math.sqrt((1+e)/(1-e))* Math.tan(E/2));
        return trueAnomaly
    }
    function updateTheDate()
    { // Display the simulated date to the right of the model.
        //  epoch.setTime(epoch.getTime() + simSpeed * 86400)
        if (simSpeed == 1) {
        epoch.setDate(epoch.getDate() + 1) ;            // At maximum speed, increment calendar by a day for each clock-cycle.
    } else {  epoch.setTime(epoch.getTime() + simSpeed * 24 * 3600000) ; }  // 24 hours * milliseconds in an hour * simSpeed

            //	 document.getElementById("modelDate").innerHTML = (epoch.getMonth() + 1) + "-" + epoch.getDate() + "-" + epoch.getFullYear() ;
    }

    function updatePosition()
    {  // With each tick of the clock, propagate the position and set the translation attribute.
        // Update the position for the following array of objects.
        var currentPosition = [] ;
    var deltaTime = 0 ;

    for (var hB in heavenlyBodies) {

        var hbTAnomoly = heavenlyBodies[hB].trueAnomoly ;
        currentPosition = heavenlyBodies[hB].propagate(hbTAnomoly) ;  // Determine the current position.

            var Xpos = currentPosition[0] ;
        var Ypos = currentPosition[1] ;
        var Zpos = currentPosition[2] ;
        var hBName = heavenlyBodies[hB].name;   // get the name of the current object and update translation

        curObj = scene.getObjectByName(hBName) ;
        curObj.position.set (Xpos, Ypos, Zpos) ;

        //	console.log(curObj.name + "  " + curObj.position.x + ",  " + curObj.position.y + ",  " + curObj.position.z  ) ;

        // Calculate mean motion n:
        var n = (2 * Math.PI) / (heavenlyBodies[hB].period * 365.25) ;   // radians per day

        // Calculate Eccentric Anomaly E based on the orbital eccentricity and previous true anomaly:
        var e = heavenlyBodies[hB].oE ;
        var f = heavenlyBodies[hB].trueAnomoly          // heavenlyBodies[hB].trueAnomoly ;
        var eA = trueToEccentricAnomaly(e,f)            // convert from true anomaly to eccentric anomaly

        // Calculate current Mean Anomaly
        var m0 = eA - e * Math.sin(eA);

        // deltaTime = (Math.abs(m0/n) - heavenlyBodies[hB].time) * simSpeed
        //  deltaTime = Math.abs(m0/n) * simSpeed
        deltaTime = simSpeed * n

        // Update Mean anomaly by adding the Mean Anomaly at Epoch to the mean motion * delaTime
        var mA = deltaTime + m0

        heavenlyBodies[hB].time = heavenlyBodies[hB].time +  deltaTime // increment timer

        eA = meanToEccentricAnomaly (e, mA)
        var trueAnomaly = eccentricToTrueAnomaly(e, eA)
        heavenlyBodies[hB].trueAnomoly = trueAnomaly

        //    console.log(hBName + " time = " +  heavenlyBodies[hB].time + "  delta time " + dt)
        //	  console.log(hBName + " eccentric anomaly " + E + " sin(f) " + sinf + " cos(f) " + cosf )
        //	  console.log(hBName + " mean anomaly " + mA + " eccentric anomaly " + eA )
        //    console.log (hBName + " trueAnomaly = " + trueAnomaly + "   true Anomaly  " + heavenlyBodies[hB].trueAnomoly + "  mean motion = " + n) ;
        //	  console.log(hBName + " eccentricity " + e + " true anomaly " + f + " Eccentric anomaly " + eA + " Mean anomaly " + m0 + " mean motion " + n)
    }
    updateTheDate() ;

    };

    /*----------------------------------------------------------------------------------------------*
        *                            {--- Global variables --}                                         *
        *----------------------------------------------------------------------------------------------*/
    var epoch = new Date('December 9, 2014');  // start the calendar
    var simSpeed = 0.75 ;                        // value from the scroll control
    var solid = false;                        // start simulation with solid rendering of orbits
    var solidLabels = false;                  // start simulation with solid rendering of Labels

    // Specify trajectories' sMA, oI, aP, oE, aN, mAe, Sidereal <-- refer to Trajectory constructor.
    // Orbital elements source: http://www.met.rdg.ac.uk/~ross/Astronomy/Planets.html#rates
    // Orbital period source: http://en.wikipedia.org/wiki/Orbital_period
    // Mean Anomoly at epoch for planets http://farside.ph.utexas.edu/teaching/celestial/Celestial/node34.html
    // Source: http://neo.jpl.nasa.gov/cgi-bin/neo_elem?type=PHA;hmax=all;max_rows=20;action=Display%20Table;show=1&sort=moid&sdir=ASC


    export function useOrbit(elements: KeplerianElements) {
        return useMemo<OrbitParameters>(() => computeOrbitParameters(elements), [elements]);
    }
