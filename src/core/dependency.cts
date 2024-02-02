export interface Node<T> {
  item: T
  before: Set<Node<T>>
  inDegree: number
}

export function useDependencySorter<T>() {
  const nodes = new Map<T, Node<T>>()

  function addBefore(item: T, dependencies: T[]) {
    const node = getNode(item)
    for (const dependency of dependencies) {
      node.before.add(getNode(dependency))
    }
  }

  function addAfter(item: T, dependencies: T[]) {
    const node = getNode(item)
    for (const dependency of dependencies) {
      getNode(dependency).before.add(node)
    }
  }

  function getNode(item: T) {
    let node = nodes.get(item)
    if (node != null) {
      return node
    }

    nodes.set(item, (node = { item, before: new Set<Node<T>>(), inDegree: 0 }))

    return node
  }

  function getItems() {
    // The ordered list.
    const items = new Array<T>()

    // Reset the nodes' in-degree.
    for (const node of nodes.values()) {
      for (const neighbor of node.before) {
        neighbor.inDegree = 0
      }
    }

    // Initialize the queue.
    const queue = new Array<Node<T>>()
    for (const node of nodes.values()) {
      if (node.inDegree === 0) {
        queue.unshift(node)
      }
    }

    // Run the queue.
    let visited = 0
    while (queue.length > 0) {
      ++visited

      const node = queue.pop()
      if (node == null) {
        throw new ReferenceError('No nodes left')
      }

      items.push(node.item)

      for (const neighbor of node.before) {
        if (--neighbor.inDegree === 0) {
          queue.unshift(neighbor)
        }
      }
    }

    // Make sure all nodes have been processed.
    // TODO: Figure out the cycle to inform the users.
    if (visited !== nodes.size) {
      throw new Error('Cyclic dependency detected in components')
    }

    return items
  }

  return {
    addBefore,
    addAfter,
    getNode,
    getItems
  }
}

export type DependencySorter<T> = ReturnType<typeof useDependencySorter<T>>
