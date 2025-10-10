pipeline {
    agent any
        tools {
            nodejs 'node-2490'
        }
    environment {
        // Load the Mongo URI from Jenkins credentials
        MONGO_URI = credentials('MONGO_URI')
        IMAGE_TAG = "v${BUILD_NUMBER}"
    }
    stages {
        stage('Installing Dependencies')
        {
            steps {
                sh 'npm install'
            }
        }
        /* stage('Dependency Fix')
        {
            parallel {
                stage('NPM Dependency Audit')
                {
                        steps {
                                sh '''
                                    npm audit --audit-level=critical
                                    echo $?
                                '''
                        }
                }
                stage('OWASP Dependency Check') {
                            steps {
                                dependencyCheck additionalArguments: '''
                                    --scan ./
                                    --out ./
                                    --format ALL
                                    --disableYarnAudit
                                    --prettyPrint''', odcInstallation: 'OWASP-12-1-6'

                                dependencyCheckPublisher failedTotalCritical: 1, pattern: 'dependency-check-report.xml', stopBuild: false
                            }
                }
            }
        }
        stage('NPM test')
        {
            steps {
                sh 'npm test'
            }
        }*/
        stage('Docker Build')
        {
            steps {
                sh 'docker build -t dev/solar-system:${IMAGE_TAG} . '
            }
        }
        stage('Trivy Scan')
        {
            steps{
                sh  ''' 
                    trivy image dev/solar-system:${IMAGE_TAG} \
                        --severity LOW,MEDIUM,HIGH \
                        --exit-code 0 \
                        --quiet \
                        --format json -o trivy-image-MEDIUM-results.json

                    trivy image dev/solar-system:${IMAGE_TAG} \
                        --severity CRITICAL \
                        --exit-code 1 \
                        --quiet \
                        --format json -o trivy-image-CRITICAL-results.json
                '''
            }
        }
        stage("aws login")
        {
            steps{
               withAWS(credentials: 'aws-creds', region: 'ap-south-1') {
            sh 'aws s3 ls'
        }
            }
        }
        stage('LOgin to ECR')
        {
            steps {
                
                withAWS(credentials: 'aws-creds', region: 'ap-south-1') {
                script {
                        sh '''
                        aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 307946649652.dkr.ecr.ap-south-1.amazonaws.com
                        docker tag dev/solar-system:${IMAGE_TAG} 307946649652.dkr.ecr.ap-south-1.amazonaws.com/dev/solar-system:${IMAGE_TAG}
                        docker push 307946649652.dkr.ecr.ap-south-1.amazonaws.com/dev/solar-system:${IMAGE_TAG}
                        '''
                    }
                }
               
            }
        }
        
    }
}

