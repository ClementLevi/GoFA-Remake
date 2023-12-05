#pragma once
#ifndef __IOSTREAM
    #define __IOSTREAM
    #include <iostream>
#endif

#ifndef __SHIP_STATS_H_
#define __SHIP_STATS_H_


// Opportunities to hit target ships.
typedef int Precision[6];
// T1               f1   b1   i1   f2   b2   i2
Precision F1_P = {  50,   5,  15,  40,   3,  12};
Precision B1_P = { 100,  15,   7,  85,  15,   5};
Precision I1_P = {  24,  75,  50,  24,  70,  45};
Precision F2_P = {  60,   6,  27,  60,   5,  21};
Precision B2_P = { 100,  20,   9,  95,  20,   9};
Precision I2_P = {  24,  90,  60,  30,  95,  55};
// Default              f1  b1  i1  f2  b2  i2
Precision DEFAULT_P = {100,100,100,100,100,100};


// Stats for each type of ship(HP, ATK, Shield).
typedef int Ship_Stats[3];
// Ship basic stats    (HP, ATK, SHIELD):
Ship_Stats F1_STATS = { 2000, 200,  50};
Ship_Stats B1_STATS = { 1125, 150,  30};
Ship_Stats I1_STATS = {  250, 100, 100};
Ship_Stats F2_STATS = { 2100, 220,  60};
Ship_Stats B2_STATS = { 1250, 175,  35};
Ship_Stats I2_STATS = {  275, 120, 120};
// Default
Ship_Stats DEFAULT_STATS = {1, 1, 1};


// Types of ship.
enum ShipTypeEnum{TYPE_DEFAULT, TYPE_F1, TYPE_F2, TYPE_B1, TYPE_B2, TYPE_I1, TYPE_I2};

// Ship is a realization for each types, where ShipTypeEnum serves as its attribute.
class Ship {
    public:
        ShipTypeEnum TYPE;
        int HP;
        int ATK;
        int SHIELD;
        Precision PRECISION;
    public:
        // Recommended method to create a ship, as its stats are pre-designed.
        Ship(ShipTypeEnum);
        // Not recommend to use this constructor, as the type is not defined.
        Ship(int hp, int atk, int shld, Precision prec=DEFAULT_P);
        void setStats(Ship_Stats, Precision);
        Ship setType(ShipTypeEnum type);
        void __showPrecision(void);
        friend std::ostream& operator << (std::ostream&, Ship);
};

// "Ships" are a cluster of same type of "ship"(-s).
class Ships:Ship{
    private:
        int count=0;
        Ship ship=Ship(TYPE_DEFAULT);
    public:
        // Recommended constructor.
        Ships(Ship, int);
        // Not good.
        Ships(void);
        Ships(Ship);
        Ships(int);

        int getCount(void);
        void setCount(int);

        float getATK(void);
        float getShield(void);
        float getHP(void);
        void operator-(int minus);
};
#endif