#pragma once
#ifndef __IOSTREAM
    #include <iostream>
    #define __IOSTREAM
#endif

#ifndef __VECTOR
    #include <vector>
    #define __VECTOR
#endif

#ifndef __SHIP_H_
#define __SHIP_H_


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


// Stats for each type of ship.
typedef unsigned int Ship_Stats[4];
// Ship basic stats    (HP, ATK, SHIELD, LOAD_CAP):
Ship_Stats F1_STATS = { 2000, 200,  50,       0  };
Ship_Stats C1_STATS = {  250, 100, 100,    3600  };
Ship_Stats B1_STATS = { 1125, 150,  30,       0  };
Ship_Stats I1_STATS = {  250, 100, 100,       0  };
Ship_Stats F2_STATS = { 2100, 220,  60,       0  };
Ship_Stats C2_STATS = {  250, 100, 100,   36000  };
Ship_Stats B2_STATS = { 1250, 175,  35,       0  };
Ship_Stats I2_STATS = {  275, 120, 120,       0  };
// Default
Ship_Stats DEFAULT_STATS = {1, 1, 1, 0};


// Types of ship.
enum ShipTypeEnum
{
    TYPE_DEFAULT,
    TYPE_F1, TYPE_C1, TYPE_B1, TYPE_I1,
    TYPE_F2, TYPE_C2, TYPE_B2, TYPE_I2
};

// Ship is an implement for each types, where ShipTypeEnum serves as its attribute.
class Ship {
    private:
        ShipTypeEnum TYPE;
        unsigned int ATK;
        unsigned int HP;
        unsigned int SHIELD;
        unsigned int LOAD_CAPACITY;
        Precision PRECISION;
        unsigned int count;
        std::vector<unsigned int> load;

        void __setStats(Ship_Stats, Precision);
    public:
        // Recommended method to create a ship, as its stats are pre-designed.
        Ship(ShipTypeEnum);

        // Not recommend to use this constructor, as the type is not defined.
        Ship
        (
            unsigned int stats[4],    // { ATK, HP, SHIELD, LOAD_CAP }
            Precision prec=DEFAULT_P,
            ShipTypeEnum t=TYPE_DEFAULT
        );

        ShipTypeEnum getTYPE();
        unsigned int getATK();
        unsigned int getHP();
        unsigned int getSHIELD();
        Precision getPRECISION();
        unsigned int getloadCapacity();
        std::vector<unsigned int> getLoad();
        unsigned int getCount();

        unsigned int getTotalHP();
        unsigned int getDEF();
        unsigned int getATKagainst(ShipTypeEnum);

        void setCount(unsigned int);

        Ship operator-(unsigned int);
        Ship operator+(unsigned int);
        Ship operator- (Ship);
        friend std::ostream& operator << (std::ostream&, Ship);
};

#endif