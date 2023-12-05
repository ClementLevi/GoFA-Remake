#pragma once

#ifndef __VECTOR__
    #include <vector>
    #define __VECTOR__
#endif

#ifndef __PARTICIPANTS_H_
    #include <PARTICIPANTS.h>
#endif

#ifndef __SIDE_H_
    #define __SIDE_H_


enum AttackerTypePhaseEnum{
    // Ship combat
    DEFAULT_ON_MOVE, F_ON_MOVE, B_ON_MOVE, I_ON_MOVE,
    // Carrier combat
    DEFAULT_CAR_ON_MOVE, MKS_ON_MOVE, VOID_ON_MOVE,
    // Planetary combat
    AERO_ON_MOVE, TROOPS_ON_MOVE

};

class Side{
    private:
        bool isDefender;
        std::vector<Participant> players;
        AttackerTypePhaseEnum attacker_type_phase;
    
    public:
        void attack(void);

};

#endif