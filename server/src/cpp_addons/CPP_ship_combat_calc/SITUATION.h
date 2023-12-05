#pragma once
#ifndef __IOSTREAM
    #define __IOSTREAM
    #include <iostream>
#endif

#ifndef __TIME
    #include <ctime>
    #define __TIME
#endif

#ifndef __PARTICIPANTS_H_
    #include "PARTICIPANTS.h"
#endif


#ifndef __SITUATION_H_
#define __SITUATION_H_

enum Phase{INIT, SHIP_COMBAT, PLANETARY_COMBAT, CARRIER_COMBAT, END};


class Situation{
    private:
        time_t event_time;
        Participant attacker, defender;
        bool attackerMoves = true;
        

    public:
        Situation(void){
        }

        Situation(Participant attacker, Participant defender){
        this->attacker = attacker;
        this->defender = defender;
        }

        

        void shipAttack();

        void aerospaceSupport();

        void landforcesClash();

        void carrierAttack();

        void stepCombatStage();

        Situation finishCalculating(){
            Situation result;
            return result;
        }
};
#endif