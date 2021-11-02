import random as r
import pymysql
import os
from Systems_Name_Generator import name_generate
from Planets_and_systems import *

class GalaxyMapGenerator:
    def __init__(self):
        self.setBoundary()

    def _validConditionFun(self, ArgTuple):
        x, y = ArgTuple # Extract x and y 提取横纵坐标
        if ():
            return x,y

    def setBoundary(self, x=3200, y=3200):
        try:
            self.x = float(x)
            self.y = float(y)
            print("Done, boundary set as (%s x %s)." % (self.x, self.y))
            return 1
        except:
            self.x = float(3200)
            self.y = float(3200)
            print("Failed. Plz check input. \nBoundary now set to default (3200 x 3200).")
            return 0

    def illustrateCoordinatesArray(self):
        def algorithm(x,y): # Set rules should x and y satisfy 设置坐标应满足的规则
            from math import sqrt, sin, cos, pi
            deg = 0.0
            theta = deg*pi/180 # Rad 弧度
            alpha, beta = 1, 1
            while deg <= 720.0:
                x_target = (alpha + beta*theta)* cos(theta)
                y_target = (alpha + beta*theta)* sin(theta)
                if sqrt((x-x_target)**2 + (y-y_target)**2) <= 2.828:
                    return x,y
                else:
                    deg += 0.5
                    theta = deg*pi/180
            
                

        xBound, yBound = self.x, self.y # Set StarBound here 星系边境从此处设置
        array = []
        for each_x in range(xBound):
            for each_y in range(yBound):
                if algorithm(each_x, each_y):
                    array.append((each_x, each_y))
    
    def startAndSave(self):
        array = self.illustrateCoordinatesArray()  # Valid coodinates list 有效坐标列表
        names = name_generate() # Generate random system list 根据自制模块产生随机地名集合

        print("Name list and coordinates array has been generated as follow.")
        print(names, array)
        if input("Continue? (Type 'n' to cancel) \n") != 'n':
            save_name = input("Please enter a name to save (overwrite) the file: ")
            sector = []
            i = 0
            for each in array:
                temp = System(array[i], names.pop())
                sector.append(temp)
                i +=1

            with open(save_name + '.sector', 'wb') as file:
                pickle.dump(sector, file)
                print("Saved.")
        else:
            print('Cancelled.')
