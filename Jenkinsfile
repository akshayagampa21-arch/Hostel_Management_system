pipeline {
    agent any

    stages {
        stage('Show branch changes') {
            steps {
                sh '''
                    branch_name="${BRANCH_NAME:-$(git rev-parse --abbrev-ref HEAD)}"
                    current_commit="${GIT_COMMIT:-HEAD}"

                    if [ -n "${GIT_PREVIOUS_COMMIT:-}" ] && git cat-file -e "${GIT_PREVIOUS_COMMIT}^{commit}" 2>/dev/null; then
                        previous_commit="$GIT_PREVIOUS_COMMIT"
                    elif git rev-parse HEAD^ >/dev/null 2>&1; then
                        previous_commit="HEAD^"
                    else
                        previous_commit="$(git hash-object -t tree /dev/null)"
                    fi

                    echo "Building branch: $branch_name"
                    echo "Changed files:"
                    git diff --name-status "$previous_commit" "$current_commit"
                '''
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci --no-audit --no-fund'
            }
        }

        stage('Validate') {
            steps {
                sh 'node --check server.js'
            }
        }

        stage('Smoke test') {
            steps {
                sh '''
                    node server.js > jenkins-server.log 2>&1 &
                    server_pid=$!
                    trap 'kill "$server_pid" 2>/dev/null || true' EXIT

                    for attempt in 1 2 3 4 5; do
                        if curl --fail --silent --show-error http://localhost:3000/ > /dev/null; then
                            exit 0
                        fi
                        sleep 1
                    done

                    cat jenkins-server.log
                    exit 1
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'jenkins-server.log', allowEmptyArchive: true
            cleanWs()
        }
    }
}