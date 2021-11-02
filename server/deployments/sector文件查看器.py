import pickle
import easygui as g
import os
from Planets_and_systems import *
while True:
    
    fileName = g.fileopenbox(msg = '请选择需要打开的*.sector原始数据', title = '打开文件',
                  default = 'E:\书籍\作业\Python\Gofa Remastered\server\admin_tools\*.sector')
    if fileName == None:
        break
    
    with open(fileName, 'rb') as file:
        root_list = pickle.load(file)
        system_namelist =[]
        for each_system_object in root_list:
            each_system_name = each_system_object.name()
            system_namelist.append(each_system_name)
            
        chosen_system_name = g.multchoicebox(choices = system_namelist)
        print(chosen_system_name)
        break
