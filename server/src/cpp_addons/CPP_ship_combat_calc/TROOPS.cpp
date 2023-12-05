#ifndef __TROOPS_H_
#include "TROOPS.h"

Troops::Troops(void)
{
    this->setCount(0);
    this->getHP();
    this->getATK();
}

Troops::Troops(int c)
{
    this->setCount(c);
    this->getHP();
    this->getATK();
}

std::ostream &operator<<(std::ostream &os, Troops &obj);

float Troops::getHP(void)
{
    if (!HP)
    {
        HP = HPperIndividual * count;
    }
    return HP;
}

float Troops::getHPi(void)
{
    return HPperIndividual;
}

void Troops::setHPi(float v)
{
    HPperIndividual = v;
    HP = HPperIndividual * count;
}

float Troops::getATK(void)
{
    if (!ATK)
    {
        ATK = ATKperIndividual * count;
    }
    return ATK;
}
float Troops::getATKi(void)
{
    return ATKperIndividual;
}

void Troops::setATKi(float v)
{
    ATKperIndividual = v;
}

int Troops::getCount(void)
{
    return count;
}

int Troops::setCount(int v)
{
    this->count = v;
    return count;
}

// int aerospaceStrafed(aerospaceForce attacker){
//     int killed=0;
//     killed = (int)(attacker.getATK() / HPperIndividual);
//     count = (count - killed )>0 ? (count - killed ) : 0;
//     return killed;
// }
//
// int bombed(aerospaceForce attacker){
//     return this->aerospaceStrafe(attacker);
// }

void Troops::clash(const Side & allies, Troops enemy)
{
    float atkA, atkD, hpA, hpD;
    int killedA = 0, killedD = 0;

    // Assuming that enemies are always defender (D).
    // If used in reversed combat, the factors should be reversed.
    atkA = this->getATK() * atkFactorA;
    atkD = enemy.getATK() * atkFactorD;
    hpA = this->getHP() * defFactorA;
    hpD = enemy.getHP() * defFactorD;

    // Calculate and minus against each other
    killedA = (int)(atkD / HPperIndividual);
    killedD = (int)(atkA / HPperIndividual);

    this->setCount((this->count - killedA) > 0 ? (this->count - killedA) : 0);
    enemy.setCount((this->count - killedD) > 0 ? (this->count - killedD) : 0);
}

Troops Troops::operator+(Troops other)
{
    this->count = this->count + other.getCount();
    return *this;
}

std::ostream &operator<<(std::ostream &os, Troops &obj)
{
    os << "Troops: " << obj.getCount() << "; ";
    return os;
}

#endif