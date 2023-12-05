#include <stdio.h>
#include <iostream>
#include "SHIP_STATS.h"


// Definition for Ship.
//Ship::Ship(int hp, int atk, int shld){
//    this->HP = hp;
//    this->ATK = atk;
//    this->SHIELD = shld;
//    this->TYPE = TYPE_DEFAULT;
//}
Ship::Ship(int hp, int atk, int shld, Precision prec){
    this->HP = hp;
    this->ATK = atk;
    this->SHIELD = shld;
    this->TYPE = TYPE_DEFAULT;

    for(int i=0;i<6;i++){
        this->PRECISION[i] = prec[i];
    }
}
Ship::Ship(ShipTypeEnum type){
    this->setType(type);
}

void Ship::setStats(Ship_Stats args, Precision p=DEFAULT_P){
    this->HP = args[0];
    this->ATK = args[1];
    this->SHIELD = args[2];

    // ==>  this->PRECISION = p;
    for(int i=0;i<6;i++){
        this->PRECISION[i] = p[i];
    }
}

Ship Ship::setType(ShipTypeEnum type){
    this->TYPE = type;
    switch (this->TYPE){
        case TYPE_F1:{
            this->setStats(F1_STATS, F1_P);
            break;
        }
        case TYPE_F2:{
            this->setStats(F2_STATS, F2_P);
            break;
        }
        case TYPE_B1:{
            this->setStats(B1_STATS, B1_P);
            break;
        }
        case TYPE_B2:{
            this->setStats(B2_STATS, B2_P);
            break;
        }
        case TYPE_I1:{
            this->setStats(I1_STATS, I1_P);
            break;
        }
        case TYPE_I2:{
            this->setStats(I2_STATS, I2_P);
            break;
        }
        default:{
            this->setStats(DEFAULT_STATS, DEFAULT_P);
            break;
        }
    } //END OF SWITCH
    return *this;
}

void Ship::__showPrecision(void){
    for(char i=0;i<6;i++){
        std::cout << this->PRECISION[i] << std::endl;
    }
}


std::ostream& operator<< (std::ostream& os, Ship obj){
    os << "Ship type: " <<obj.TYPE << std::endl;
    os << "ATK: " << obj.ATK << "\t";
    os << "HP: " << obj.HP << "\t";
    os << "Shield: " << obj.SHIELD << std::endl;
    os << "Precision against each type: ";
    for (int i=0; i<(sizeof(obj.PRECISION)/sizeof(obj.PRECISION[0]) ); i++){
        os << obj.PRECISION[i] << "\t";
    }
//    os << std::endl;

    return os;
}




// Types of Ship.
//Ship F1 = Ship(TYPE_F1);
//Ship B1 = Ship(TYPE_B1);
//Ship I1 = Ship(TYPE_I1);
//Ship F2 = Ship(TYPE_F2);
//Ship B2 = Ship(TYPE_B2);
//Ship I2 = Ship(TYPE_I2);


// Definition of Ships.
Ships::Ships(Ship obj, int v){
    this->ship = obj;
    if (v>=0){
        this->setCount(v);
    }
    else{
        this->setCount(0);
    }
}


// Not good.
Ships::Ships(void){
    this->ship = Ship(TYPE_DEFAULT);
}
// Not good.
Ships::Ships(Ship obj){
    this->ship = obj;
    this->setCount(0);
}
// Still not good.
Ships::Ships(int v){
    this->ship = Ship(TYPE_DEFAULT);
    if (v>=0){
        this->setCount(v);
    }
    else{
        this->setCount(0);
    }
}


int Ships::getCount(void){
    return this->count;
}
void Ships::setCount(int v){
    if (v>=0){
        this->setCount(v);
    }
    else{
        this->setCount(0);
    }
}

void Ships::operator-(int minus){
    this->count -= minus;
}

float Ships::getATK(void){ return this->count * this->ATK; }
float Ships::getShield(void){ return this->count * this->SHIELD; }
float Ships::getHP(void){ return this->count * this->HP; }
