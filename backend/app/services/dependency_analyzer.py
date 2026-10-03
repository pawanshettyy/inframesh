from typing import List, Dict, Set, Tuple, Optional
import networkx as nx

class DependencyAnalyzer:
    """
    Graph-based dependency analysis for distributed microservice architectures using NetworkX.
    Computes topological propagation paths, upstream/downstream blast radiuses, and root cause node ranking.
    """
    def __init__(self):
        self.graph = nx.DiGraph() # Edge (A -> B) means A calls B (A depends on B)
        self._init_default_topology()

    def _init_default_topology(self) -> None:
        edges = [
            ("api-gateway", "auth-service"),
            ("api-gateway", "order-service"),
            ("api-gateway", "user-service"),
            ("order-service", "payment-service"),
            ("order-service", "inventory-service"),
            ("order-service", "kafka-bus"),
            ("payment-service", "postgres-db"),
            ("payment-service", "stripe-gateway"),
            ("payment-service", "kafka-bus"),
            ("inventory-service", "postgres-db"),
            ("inventory-service", "redis-cache"),
            ("auth-service", "redis-cache"),
            ("auth-service", "postgres-db"),
            ("user-service", "redis-cache"),
            ("user-service", "postgres-db"),
            ("notification-service", "kafka-bus"),
        ]
        self.graph.add_edges_from(edges)

    def get_propagation_path(self, root_node: str, target_node: str) -> List[str]:
        """Returns the shortest path from caller target_node down to root_node, reversed for causal flow."""
        try:
            # Downward dependency path from target_node to root_node
            path = nx.shortest_path(self.graph, source=target_node, target=root_node)
            # Reverse to represent failure origin -> symptom propagation
            return list(reversed(path))
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return [root_node, target_node]

    def calculate_blast_radius(self, root_service: str) -> List[str]:
        """Finds all upstream services that directly or indirectly depend on root_service."""
        reversed_graph = self.graph.reverse()
        if root_service in reversed_graph:
            impacted = list(nx.descendants(reversed_graph, root_service))
            return [root_service] + impacted
        return [root_service]

    def get_topological_depth(self, node: str) -> int:
        """Returns depth in hierarchy (Leaf DB nodes have highest depth from edge)."""
        try:
            paths = nx.single_source_shortest_path_length(self.graph, "api-gateway")
            return paths.get(node, 0)
        except Exception:
            return 0

dependency_analyzer = DependencyAnalyzer()
