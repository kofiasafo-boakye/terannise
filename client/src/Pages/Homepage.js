import {Container, Box, Text, Tab, Tabs, TabPanel, TabList, TabPanels, Center} from '@chakra-ui/react'
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";



const Homepage = () => {

    const history = useHistory();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("userInfo"));

        //if uer is not logged in theyd be redirected to the home page
        if (user) history.push("/chats");

    }, [history]);


    return ( 

        <Container maxW = 'xl' centercontent = "true">
            <Box
                display="flex"
                justifyContent="center"
                p={3}
                bg="white"
                w="100%"
                m="20px 0 15px 0" //initially was m="40px 0 15px 0"
                borderRadius="lg"
                borderWidth="1px"
            
            >
             <Text fontSize="4xl" fontFamily="Work sans" >Terannise</Text>
             {/* <Center fontSize="4xl" fontFamily="Work sans">Terannise</Center> */}

            </Box>
            <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
                <Tabs isFitted variant="soft-rounded">
                    <TabList mb="1em">
                        <Tab>Login</Tab>
                        <Tab>Sign Up</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Login />
                        </TabPanel>
                        <TabPanel>
                            <Signup />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Container>
    );
}
 
export default Homepage;