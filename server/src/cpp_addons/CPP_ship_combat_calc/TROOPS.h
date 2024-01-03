#pragma once


#ifndef __IOSTREAM
    #include <iostream>
#endif


#ifndef __TROOPS_H_
#define __TROOPS_H_

class Troops{
    private:
        int count;
        float HPperIndividual=80.0;
        float HP;
//        float ATKperIndividual=16.0; // You are not grenediers. Stop messing around with 98ks.
        float ATKperIndividual=80.0;
        float ATK;
    public:
        // Recommended constructor.
        Troops(int);
        // Not recommended.
        Troops(void);
        // Show count.
        friend std::ostream& operator<<(std::ostream& os, Troops& obj);

        float getHP(void);
        float getHPi(void);
        void  setHPi(float v);

        float getATK(void);
        float getATKi(void);
        void  setATKi(float v);

        int getCount(void);
        int setCount(int v);

        // Let the troops attack the other group, while taking damage from doing so.
        void clash(const Side &allies, Troops enemy);
        // Get reinforced.
        Troops operator+(Troops other);
        Troops operator-(Troops);
};

#endif