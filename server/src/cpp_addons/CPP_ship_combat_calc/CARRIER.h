#pragma once

#ifndef __VECTOR
    #define __VECTOR
    #include <vector>
#endif

#ifndef __SHIP_H_
    #define __SHIP_H_
    #include "SHIP.h"
#endif


#ifndef __CARRIER_H_
#define __CARRIER_H_


enum CarrierTypeEnum{
    TYPE_DEFAULT,
    TYPE_MK1,
    TYPE_MK2,
    TYPE_MK3,
    TYPE_VOID
};


typedef unsigned char Received_P[7];
/* This indicates how possible for a carrier to receive damage from
 * each type of enemies. Note that this includes damage from ships
 * other than merely carriers.
 * -> Against default type, mk1, 2, 3, void, and bombers 1, 2.
 */
const Received_P RP_CAR_DEFAULT = {};
const Received_P RP_CAR_MK1 = {};
const Received_P RP_CAR_MK2 = {};
const Received_P RP_CAR_MK3 = {};
const Received_P RP_CAR_VOID = {};


typedef struct {
    unsigned int TYPE : 2;
    unsigned int LV : 5;
} CVupgrade;


class Carrier{
    private:
        CarrierTypeEnum TYPE;
        unsigned int HP;
        unsigned int ATK;
        Received_P RP;
        std::vector<Ship> cargo;
        CVupgrade upgrade;

    public:
        Carrier();

        CarrierTypeEnum getTYPE();
        unsigned int getHP();
        unsigned int getATK();
        Received_P *getRP();
        std::vector<Ship> getCargo();
        CVupgrade getUpgrade();

        void setCargo(std::vector<Ship>);
        void setCargo(std::vector<int>);
        void setCargo(int[8]);
        void setUpgrade(CVupgrade);

        Carrier operator- (Carrier);
};

#endif