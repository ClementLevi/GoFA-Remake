#ifndef __SHIP_H_
    #include "SHIP.h"
    #define __SHIP_H_
#endif



Ship::Ship(ShipTypeEnum type){
    this->setType(type);
}

void Ship::__setStats(Ship_Stats args, Precision p=DEFAULT_P){
    this->HP = args[0];
    this->ATK = args[1];
    this->SHIELD = args[2];

    // ==>  this->PRECISION = p;
    for(int i=0;i<6;i++){
        this->PRECISION[i] = p[i];
    }
}

Ship Ship::Ship(ShipTypeEnum type){
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



ShipTypeEnum Ship::getTYPE(){ return this->TYPE; }
unsigned short Ship::getATK(){ return this->ATK; }
unsigned short Ship::getHP(){ return this->HP; }
unsigned short Ship::getSHIELD(){ return this->SHIELD; }
Precision Ship::*getPRECISION(){ return this->PRECISION; }
unsigned int Ship::getloadCapacity(){ return this->LOAD_CAPACITY;}
std::vector<unsigned int> Ship::getLoad(){ return this->load; }
unsigned int Ship::getCount(){ return this->count; }

unsigned int Ship::getTotalHP(){
    return this->HP * this->count;
}

unsigned int Ship::getDEF(){
    return this->SHIELD * this->count;
}
unsigned int Ship::getATKagainst(ShipTypeEnum target_type){
    return (unsigned int)(this->)
}

void Ship::setCount(unsigned int v){
    if (v>=0){
        this->count=v;
    }
    else{
        this->count=0;
    }
}

Ship operator- (Ship other){
    // This should be calculating combat result.
    return this;
}


Ship Ship::operator-(unsigned int minus){
    this->count -= minus;
    return this;
}

Ship Ship::operator+(unsigned int plus){
    this->count += plus;
    return this;
}

friend std::ostream& operator << (std::ostream& out, Ship obj){
    out << "(" << obj.getTYPE() << ": " << obj.getCount() << ")";
    return out;
}
