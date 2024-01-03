#pragma once
#ifndef __IOSTREAM
    #define __IOSTREAM
    #include <iostream>
#endif

#ifndef __VECTOR
    #include <vector>
    #define __VECTOR
#endif


#ifndef __TIME
    #include <ctime>
    #define __TIME
#endif

#ifndef __SIDE_H_
    #include "SIDE.h"
#endif


#ifndef __SITUATION_H_
#define __SITUATION_H_

enum SituationPhaseEnum{BEGIN, SHIP_COM, CAR_COM, LAND_COM, END};

class Situation{
    private:
//        time_t event_time;    // This is for JS Level
        Side attackers, defenders;
        bool isAttackersMove = false;

        bool __flipAttackerMoveFlag();

    public:
        Situation(void);

        Situation(Side, Side);
//
//        void shipAttack();
//
//        void aerospaceSupport();
//
//        void landforcesClash();
//
//        void carrierAttack();

        void step(int);

        Situation finish(void);
};
#endif